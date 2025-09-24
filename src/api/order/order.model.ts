import { Document, model, Schema, Types } from 'mongoose'
import crypto from 'crypto'

interface IOrderProduct {
  product: Types.ObjectId
  quantity: number
  variant?: {
    color?: string
    size?: string
    weight?: number
  }
}



interface IAddress {
  fullName: string
  email?: string
  phone: string
  district: string
  addressLine: string
  postalCode: string
}

interface IStatusHistory {
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'
  changedAt: Date
  changedBy?: Types.ObjectId
}

interface IPaymentDetails {
  amount?: number
  currency?: string
  gateway: string
  paymentMethod: string
  transactionId?: string
  receiptUrl?: string
  refundedAt?: Date
}

export interface IOrder extends Document {
  user: Types.ObjectId
  products: IOrderProduct[]
  shippingAddress: IAddress
  billingAddress?: IAddress
  orderStatus: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'
  statusHistory?: IStatusHistory[]
  paymentStatus: 'Pending' | 'Success' | 'Failed' | 'Refunded'
  paymentDetails?: IPaymentDetails
  subtotal: number
  discountAmount: number
  shippingFee?: number
  finalAmount: number
  promoCode?: string
  coupon?: Types.ObjectId
  invoiceNumber?: string
  orderId?: string
  notes?: string
  deliveredAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    district: { type: String, required: true },
    addressLine: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
)

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    variant: {
      color: { type: String },
      size: { type: String },
      weight: { type: Number },
    },
  },
  { _id: false }
)

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
      required: true,
    },
    changedAt: { type: Date, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
)

const PaymentDetailsSchema = new Schema<IPaymentDetails>(
  {
    gateway: { type: String, required: true },
    transactionId: { type: String },
    receiptUrl: { type: String },
    refundedAt: { type: Date },
    amount: { type: Number },
    currency: { type: String },
    paymentMethod: { type: String, enum: ['sslcommerz', 'cash-on-delivery'] },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: [OrderProductSchema], required: true },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    statusHistory: [StatusHistorySchema],
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Success', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentDetails: PaymentDetailsSchema,
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    promoCode: { type: String },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    invoiceNumber: { type: String },
    orderId: { type: String, unique: true },
    notes: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
)

const generateShortId = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

// Helper to format today's date as YYYYMMDD
const getTodayString = () => {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}${String(now.getDate()).padStart(2, '0')}`
}

// Pre-save hook
OrderSchema.pre<IOrder>('save', async function (next) {
  // Generate orderId like ORD-20250424-XYZ123
  if (!this.orderId) {
    const shortId = generateShortId()
    this.orderId = `ORD-${getTodayString()}-${shortId}`
  }

  // Generate invoiceNumber like INV-20250424-0001
  if (!this.invoiceNumber) {
    const today = getTodayString()
    const count = await OrderModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    })
    const sequence = String(count + 1).padStart(4, '0')
    this.invoiceNumber = `INV-${today}-${sequence}`
  }

  next()
})

export const OrderModel = model<IOrder>('Order', OrderSchema)
