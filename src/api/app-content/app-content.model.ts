import { Document, model, Schema, Types } from 'mongoose'
import { IAppContentPayload } from './app-content-zod-schema'

interface IAppContent extends Document, IAppContentPayload {}

const SuccessStatsSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    successCount: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const AppContentSchema = new Schema<IAppContent>(
  {
    privacyPolicy: String,
    refundPolicy: String,
    termsAndConditions: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const AppContentModel = model<IAppContent>(
  'AppContent',
  AppContentSchema
)
