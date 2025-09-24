import { z } from 'zod'

export const zodCouponSchema = z.object({
  body: z
    .object({
      promoCode: z
        .string({
          required_error: 'Discount code is required',
          invalid_type_error: 'Discount code must be a string',
        })
        .min(3, { message: 'Code must be at least 3 characters' })
        .max(10, { message: 'Code must not exceed 10 characters' })
        .regex(/^[A-Z0-9]+$/, {
          message: 'Promo code must contain only uppercase letters and numbers',
        }),

      discountType: z.enum(['percentage', 'fixed'], {
        required_error: 'Discount type is required',
        invalid_type_error: 'Discount type must be either percentage or fixed',
      }),

      // eligibleAfter: z
      //   .string({
      //     invalid_type_error: 'Eligible after must be a string',
      //   })
      //   .datetime({ message: 'Invalid date format, allowed ISO-string' })
      //   .optional(),

      discountValue: z
        .number({
          required_error: 'Discount value is required',
          invalid_type_error: 'Discount value must be a number',
        })
        .int('Discount value must be integer number')
        .positive('Discount value must be positive number'),

      minimumOrderValue: z
        .number({
          required_error: 'Minimum order value is required',
          invalid_type_error: 'Minimum order value must be a number',
        })
        .min(1, { message: 'Minimum order value must be positive number' }),

      firstOrderOnly: z.boolean({
        required_error: 'firstOrderOnly is required',
        invalid_type_error: 'firstOrderOnly must be a boolean value',
      }),

      startDate: z
        .string({
          required_error: 'Start date is required',
          invalid_type_error: 'Start date must be a string',
        })
        .datetime({ message: 'Invalid date format' }),

      expirationDate: z
        .string({
          required_error: 'Expiration date is required',
          invalid_type_error: 'Expiration date must be a string',
        })
        .datetime({ message: 'Invalid date format' }),

      status: z.enum(['active', 'inactive'], {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be either active or inactive',
      }),
    })
    .refine(
      (data) => new Date(data.expirationDate) > new Date(data.startDate),
      {
        message: 'Expiration date must be after the start date',
        path: ['expirationDate'],
      }
    ),
})

export const zodValidationCode = z.object({
  body: z.object({
    promoCode: z.string({
      required_error: 'Discount promo code is required',
      invalid_type_error: 'Discount promo code must be a string',
    }),
    orderValue: z
      .number({
        required_error: 'Order value is required',
        invalid_type_error: 'Order value must be a number',
      })
      .positive('Order value must be positive number'),
  }),
})

export type ICouponPayload = z.infer<typeof zodCouponSchema>['body']
export type IPromoCodePayload = z.infer<typeof zodValidationCode>['body']
