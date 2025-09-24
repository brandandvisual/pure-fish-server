import { Types } from 'mongoose'
import { z } from 'zod'

export const zodAppContentSchema = z.object({
  body: z.object({
    privacyPolicy: z.string().optional(),
    refundPolicy: z.string().optional(),
    termsAndConditions: z.string().optional(),
  }),
})

export type IAppContentPayload = z.infer<typeof zodAppContentSchema>['body']
