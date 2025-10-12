import { Document, model, Schema, Types } from 'mongoose'

export type NotificationType = 'order_success' | 'order_failed'

export interface INotificationPayload {
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  orderId: Types.ObjectId
  customerName: string
  amount: number
}

export interface INotification extends INotificationPayload, Document {
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['order_success', 'order_failed'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const NotificationModel = model<INotification>(
  'Notification',
  notificationSchema
)
