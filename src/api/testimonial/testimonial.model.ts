import { Document, model, Schema } from 'mongoose'

interface ITestimonial extends Document {
  fullName: string
  feedback: string
  isActive: boolean
  avatar: Schema.Types.ObjectId
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'App-Media',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const TestimonialModel = model<ITestimonial>(
  'Testimonial',
  testimonialSchema
)
