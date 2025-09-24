import { z } from 'zod'

export const zodMessageSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        required_error: 'First name is required.',
        invalid_type_error: 'First name must be string',
      })
      .min(2, 'First name must be 2 to 15 characters long.')
      .max(15, 'First name must be 2 to 15 characters long.')
      .regex(/^[A-Za-z\s]+$/, 'Only alphabetic characters are allowed'),

    lastName: z
      .string({
        required_error: 'Last name is required.',
        invalid_type_error: 'Last name must be string',
      })
      .min(2, 'Last name must be 2 to 15 characters long.')
      .max(15, 'Last name must be 2 to 15 characters long.')
      .regex(/^[A-Za-z\s]+$/, 'Only alphabetic characters are allowed'),

    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be string',
      })
      .email('Invalid email format.'),

    phone: z
      .string({ required_error: 'Phone is required' })
      .regex(/^(01\d{9}|(\+8801\d{9}))$/, {
        message: 'Phone number must be a valid Bangladeshi number.',
      }),

    message: z
      .string({ required_error: 'Message is required' })
      .max(800, 'Message can be up to 800 characters long.'),
  }),
})

export type IMessagePayload = z.infer<typeof zodMessageSchema>['body']
