import { Document, model, Schema } from 'mongoose'

export interface IMedia extends Document {
  uploader: Schema.Types.ObjectId
  originalName: string
  asset_id: string
  public_id: string
  format: string
  resource_type: string
  bytes: number
  url: string
  secure_url: string
  folder: string
  access_mode: 'authenticated' | 'public'
  version: number
  signature: string
  type: string
}

const mediaSchema = new Schema<IMedia>(
  {
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    asset_id: {
      type: String,
    },
    public_id: {
      type: String,
    },
    format: {
      type: String,
      trim: true,
    },
    resource_type: {
      type: String,
      enum: ['image', 'video', 'raw', 'other'],
    },
    bytes: {
      type: Number,
      min: 0,
    },
    url: {
      type: String,
    },
    secure_url: {
      type: String,
    },
    folder: {
      type: String,
      trim: true,
    },
    access_mode: {
      type: String,
      enum: ['authenticated', 'public'],
    },
    version: {
      type: Number,
    },
    signature: {
      type: String,
    },
    type: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const MediaModel = model<IMedia>('Media', mediaSchema)
