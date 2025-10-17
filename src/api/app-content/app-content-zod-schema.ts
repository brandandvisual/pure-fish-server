import { Types } from 'mongoose'
import { z } from 'zod'

export const zodAppContentSchema = z.object({
  body: z.object({
    privacyPolicy: z.string().optional(),
    refundPolicy: z.string().optional(),
    termsAndConditions: z.string().optional(),
    whyPureFish: z
      .object({
        description: z.string().optional(),
        image: z
          .string()
          .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Invalid ObjectId",
          })
          .optional(),
      })
      .optional(),
  }),
})

export type IAppContentPayload = z.infer<typeof zodAppContentSchema>['body']
