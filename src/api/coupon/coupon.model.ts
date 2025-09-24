import { Document, Schema, model } from 'mongoose'
import { ICouponPayload } from './coupon.zod-schema'

interface ICoupon extends Document, ICouponPayload {
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const couponSchema = new Schema<ICoupon>(
  {
    promoCode: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    discountValue: Number,
    minimumOrderValue: Number,
    firstOrderOnly: Boolean,
    startDate: String, // ISO string
    expirationDate: String, // ISO string
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
)

export const CouponModel = model<ICoupon>('Coupon', couponSchema)
