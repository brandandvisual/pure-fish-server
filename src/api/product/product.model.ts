import { Document, model, Schema, Types } from 'mongoose'
import { IProductPayload, IVariant } from './product.zod-schema'
import slugify from 'slugify'

interface IProduct
  extends Document,
    Omit<IProductPayload, 'category' | 'images'> {
  category: Types.ObjectId
  images: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const VariantSchema = new Schema<IVariant>(
  {
    color: { type: String },
    size: { type: String },
    weight: { type: Number },
  },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    short_desc: { type: String, required: true, trim: true },
    long_desc: { type: String, required: true, trim: true },
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      finalPrice: { type: Number, min: 0 },
      discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    },
    brand: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    tags: [{ type: String, trim: true }],
    images: [{ type: Schema.Types.ObjectId, ref: 'Media', required: true }],
    meta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },
    variants: VariantSchema,
    saleCategory: {
      type: String,
      enum: [
        'none',
        'limited-time',
        'exclusive',
        'seasonal',
        'new-arrival',
        'best-deal',
        'best-seller',
      ],
      default: 'none',
    },
  },
  { timestamps: true, versionKey: false }
)

ProductSchema.index(
  {
    title: 'text',
    short_desc: 'text',
    long_desc: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 5,
      short_desc: 3,
      long_desc: 2,
      tags: 1,
    },
  }
)

ProductSchema.pre<IProduct>('save', async function (next) {
  // pricing
  if (this.isModified('pricing') || this.isNew) {
    const { basePrice } = this.pricing
    const discount = this.pricing?.discountPercentage ?? 0
    const discountAmount = (basePrice * discount) / 100
    this.pricing.finalPrice = Math.ceil(basePrice - discountAmount)
  }
  // slug
  if (!this.isNew) {
    return next()
  }

  let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true })

  let slug = baseSlug
  let counter = 1

  while (await (this.constructor as typeof ProductModel).findOne({ slug })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  this.slug = slug
  next()
})

export const ProductModel = model<IProduct>('Product', ProductSchema)
