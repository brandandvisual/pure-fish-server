import { Document, model, Schema } from 'mongoose'
import { IMessagePayload } from './message.zod-schema'

interface IMessage extends Document, IMessagePayload {
  isRead: boolean
}

const messageSchema = new Schema<IMessage>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const MessageModel = model<IMessage>('Message', messageSchema)
