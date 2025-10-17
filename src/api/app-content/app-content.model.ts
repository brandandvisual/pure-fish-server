import { Document, model, Schema, Types } from 'mongoose'
import { IAppContentPayload } from './app-content-zod-schema'
import { ref } from 'node:process';

interface IAppContent extends Document, IAppContentPayload { }

const WhyPureFishSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  image: [{ type: Schema.Types.ObjectId, ref: 'Media', required: true }],
});
const AppContentSchema = new Schema<IAppContent>(
  {
    privacyPolicy: String,
    refundPolicy: String,
    termsAndConditions: String,
    whyPureFish: WhyPureFishSchema,
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
