import { Types } from 'mongoose'
import { z } from 'zod'

const AddressSchema = z.object({
  fullName: z.string({
    required_error: 'Full name is required',
    invalid_type_error: 'Full name must be a string',
  }),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format'),
  phone: z
    .string({
      required_error: 'Phone is required',
      invalid_type_error: 'Phone must be a string',
    })
    .regex(/^(01\d{9}|(\+8801\d{9}))$/, 'Invalid phone number format'),
  district: z.string({
    required_error: 'District is required',
    invalid_type_error: 'District must be a string',
  }),
  addressLine: z.string({
    required_error: 'Address line is required',
    invalid_type_error: 'Address line must be a string',
  }),
  postalCode: z.string({
    required_error: 'Postal code is required',
    invalid_type_error: 'Postal code must be a string',
  }),
})

const OrderProductSchema = z.object({
  product: z
    .string({
      required_error: 'Product ID is required',
      invalid_type_error: 'Product ID must be a string',
    })
    .refine((val) => Types.ObjectId.isValid(val), 'Invalid Product ID format'),
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .int('Quantity must be an integer')
    .positive('Quantity must be a positive integer'),
  variant: z
    .object({
      color: z
        .string({
          invalid_type_error: 'Color must be a string',
        })
        .optional(),
      size: z
        .string({
          invalid_type_error: 'Size must be a string',
        })
        .optional(),
      weight: z
        .number({
          invalid_type_error: 'Weight must be a number',
        })
        .positive('Weight must be a positive number')
        .optional(),
    })
    .optional(),
})

export const OrderValidationSchema = z.object({
  body: z.object({
    products: z
      .array(OrderProductSchema)
      .min(1, 'At least one product is required'),
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema.optional(),
    coupon: z
      .string({
        required_error: 'Coupon is required',
        invalid_type_error: 'Coupon must be a string',
      })
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid coupon id format')
      .optional(),
    notes: z
      .string({ invalid_type_error: 'notes must be a string' })
      .optional(),
    paymentMethod: z.enum(['sslcommerz', 'cash-on-delivery'], {
      required_error: 'Payment Method is required*',
      invalid_type_error:
        'Payment method must be either sslcommerz or cash-on-delivery',
    }),
  }),
})

export const zodOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['Pending', 'Processing', 'Delivered', 'Cancelled'], {
      required_error: 'orderStatus is required',
      invalid_type_error:
        'orderStatus must be Pending | Processing | Delivered | Cancelled',
    }),
  }),
})

export type IOrderStatusPayload = z.infer<typeof zodOrderStatusSchema>["body"]
export type IOrderPayload = z.infer<typeof OrderValidationSchema>['body']
