import { Document, model, Schema } from 'mongoose'
import { IGuestPayload } from './guest.zod-schema'

export interface IGuest extends Document, IGuestPayload {
  createdAt: Date
  updatedAt: Date
}

const guestSchema = new Schema<IGuest>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    companyName: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const GuestModel = model<IGuest>('Guest', guestSchema)
