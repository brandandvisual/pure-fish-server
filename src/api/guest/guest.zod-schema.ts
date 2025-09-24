import { z } from 'zod'

export const zodGuestSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .max(30, 'Full name can be upto 30 characters long.'),

    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format.'),

    phone: z
      .string({ required_error: 'Phone is required' })
      .regex(/^(01\d{9}|(\+8801\d{9}))$/, {
        message: 'Phone number must be a valid Bangladeshi number.',
      }),

    companyName: z.string().optional(),
  }),
})

export type IGuestPayload = z.infer<typeof zodGuestSchema>['body']
