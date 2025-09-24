import { Document, model, Schema } from 'mongoose'
import slugify from 'slugify'
import { ICatPayload } from './cat.zod-schema'

interface ICategory extends Document, Omit<ICatPayload, 'slug'> {
  slug: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    meta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },
  },
  { timestamps: true, versionKey: false }
)

CategorySchema.pre<ICategory>('save', async function (next) {
  if (!this.isNew) {
    return next()
  }
  let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true })

  let slug = baseSlug
  let counter = 1

  while (await (this.constructor as typeof CategoryModel).findOne({ slug })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  this.slug = slug
  next()
})

export const CategoryModel = model<ICategory>('Category', CategorySchema)
