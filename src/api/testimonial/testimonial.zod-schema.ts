import { Types } from 'mongoose'
import { z } from 'zod'

export const zodTestimonialSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .max(40, 'Full name must not exceed 40 characters'),

    feedback: z
      .string()
      .min(1, 'Feedback is required')
      .max(1000, 'Feedback must not exceed 1000 characters'),

    avatar: z
      .string({ required_error: 'Avatar _id is required' })
      .refine((value) => Types.ObjectId.isValid(value), {
        message: 'Avatar media id is not valid',
      }),
  }),
})

export type ITestimonialSchema = z.infer<typeof zodTestimonialSchema>['body']
