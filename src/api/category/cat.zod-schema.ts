import { Types } from 'mongoose'
import { z } from 'zod'

const MetaSchema = z.object({
  title: z
    .string({ invalid_type_error: 'Meta title must be a string' })
    .optional(),
  description: z
    .string({ invalid_type_error: 'Meta description must be a string' })
    .optional(),
  keywords: z
    .array(z.string({ invalid_type_error: 'Keyword must be a string' }), {
      invalid_type_error: 'Keywords must be an array',
    })
    .optional(),
})

export const CatValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string',
      })
      .trim(),

    slug: z
      .string({
        invalid_type_error: 'Slug must be a string',
      })
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        'Invalid slug format. Use lowercase letters, numbers, and hyphens without consecutive or trailing hyphens'
      )
      .optional(),

    image: z
      .string({
        required_error: 'Image is required',
        invalid_type_error: 'Image must be a string',
      })
      .refine((arg) => Types.ObjectId.isValid(arg), {
        message: 'Invalid media _id',
      }),

    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim(),

    meta: MetaSchema.optional(),
  }),
})

export type ICatPayload = z.infer<typeof CatValidationSchema>['body']
