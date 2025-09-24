import { z } from 'zod'

export const signupSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be string',
      })
      .min(3, 'First name must be 3 to 30 characters long.')
      .max(30, 'First name must be 3 to 30 characters long.'),

    email: z
      .string({
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email format.')
      .optional(),

    phone: z
      .string({
        required_error: 'Phone is required',
        invalid_type_error: 'Phone must be a string',
      })
      .regex(
        /^(01\d{9}|(\+8801\d{9}))$/,
        'Phone number must be a valid number.'
      ),

    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string',
      })
      .min(6, 'Password must be at least 6 characters long.')
      .refine((value) => /^(?=.*[a-zA-Z])(?=.*\d)/.test(value), {
        message: 'Password must contain both letters and numbers.',
      }),
  }),
})

export const signinSchema = z.object({
  body: z.object({
    email_phone: z.string({
      required_error: 'Email or Phone is required',
      invalid_type_error: 'Email or Phone must be a string',
    }),

    password: z.string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string',
    }),
  }),
})

export const otpSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email format.'),
    password: z.string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string',
    }),
    otp: z
      .string({
        required_error: 'OTP is required.',
        invalid_type_error: 'OTP must be a string',
      })
      .length(5, 'Incorrect OTP, Please check again.'),
  }),
})

export const zodUpdatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Password is required.'),
    newPassword: z
      .string()
      .min(1, 'Password is required.')
      .min(6, 'Password must be at least 6 characters long.')
      .refine((value) => /^(?=.*[a-zA-Z])(?=.*\d)/.test(value), {
        message: 'Password must contain both letters and numbers.',
      }),
  }),
})

export const zodTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      required_error: 'Token is required.',
      invalid_type_error: 'Token must be of type string',
    }),
  }),
})

export const zodForgotPassSchema = z.object({
  body: z.object({
    identifier: z.union([
      z.string().email('Invalid email'),
      z.string().regex(/^(01\d{9}|(\+8801\d{9}))$/, 'Invalid phone'),
    ])
  })
})
export const zodResetPassSchema = z.object({
  body: z.object({
    newPassword: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be string',
      })
      .min(6, 'Password must be at least 6 characters long.')
      .refine((value) => /^(?=.*[a-zA-Z])(?=.*\d)/.test(value), {
        message: 'Password must contain both letters and numbers.',
      }),
  }),
})
export const zodUpdateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .optional()
      .refine((value) => !value || (value.length >= 2 && value.length <= 15), {
        message: 'First name must be 2 to 15 characters long.',
      }),
    lastName: z
      .string()
      .optional()
      .refine((value) => !value || (value.length >= 2 && value.length <= 15), {
        message: 'Last name must be 2 to 15 characters long.',
      }),
    phone: z
      .string()
      .optional()
      .refine((value) => !value || /^(01\d{9}|(\+8801\d{9}))$/.test(value), {
        message: 'Phone number must be a valid Bangladeshi number.',
      }),
  }),
})

export const zodAddressSchema = z.object({
  body: z.object({
    houseNo: z.string({
      required_error: 'House no/name is required',
      invalid_type_error: 'House no/name must be string',
    }),
    roadNo: z.string({
      required_error: 'Road no/name is required',
      invalid_type_error: 'Road no/name must be string',
    }),
    area: z.string({
      required_error: 'Area is required',
      invalid_type_error: 'Area must be string',
    }),
    district: z.string({
      required_error: 'District is required',
      invalid_type_error: 'District must be string',
    }),
    note: z.string({ invalid_type_error: 'Note must be string' }).optional(),
  }),
})

export const googleUserSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be string',
  }),

  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format.'),

  image: z
    .string({
      invalid_type_error: 'Image must be a string',
    })
    .url('Invalid image URL.')
    .nullish(),
})

export const googleProfileSchema = z.object({
  email_verified: z.boolean({
    required_error: 'email_verified is required',
    invalid_type_error: 'email_verified must be boolean',
  }),
})

export const otpSchemaPhone = z.object({
  body: z.object({
    phone: z
      .string({
        required_error: 'Phone is required',
        invalid_type_error: 'Phone must be a string',
      })
      .regex(
        /^(01\d{9}|(\+8801\d{9}))$/,
        'Phone number must be a valid number.'
      ),
    password: z.string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string',
    }),
    otp: z
      .string({
        required_error: 'OTP is required.',
        invalid_type_error: 'OTP must be a string',
      })
      .length(5, 'Incorrect OTP, Please check again.'),
  }),
})

export type ISignupPayload = z.infer<typeof signupSchema>['body']
export type ISigninPayload = z.infer<typeof signinSchema>['body']
export type IOTPPayload = z.infer<typeof otpSchema>['body']
export type IUpdatePasswordPayload = z.infer<
  typeof zodUpdatePasswordSchema
>['body']
export type ITokenPayload = z.infer<typeof zodTokenSchema>['body']
export type IForgotPassPayload = z.infer<typeof zodForgotPassSchema>['body']
export type IUpdateProfilePayload = z.infer<
  typeof zodUpdateProfileSchema
>['body']
export type IAddressPayload = z.infer<typeof zodAddressSchema>['body']
export type IOTPPayloadPhone = z.infer<typeof otpSchemaPhone>['body']
