import { z } from 'zod'
import { Types } from 'mongoose'

const VariantSchema = z.object({
  color: z
    .array(
      z.object({
        name: z.string({
          required_error: 'Color Name is required',
          invalid_type_error: 'Color name must be string',
        }),
        code: z.string({
          required_error: 'Color code is required',
          invalid_type_error: 'Color code must be string',
        }),
      }),
      { invalid_type_error: 'Must be an array' }
    )
    .optional(),
  size: z
    .array(
      z.string({
        required_error: 'Color code is required',
        invalid_type_error: 'Color code must be string',
      }),
      { invalid_type_error: 'Must be an array' }
    )
    .optional(),
  weight: z
    .number({
      required_error: 'Weight is required',
      invalid_type_error: 'Weight must be number (unit-gram)',
    })
    .optional(),
})

const MetaSchema = z.object({
  title: z
    .string({
      invalid_type_error: 'Meta title must be string',
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: 'Meta desc must be string',
    })
    .optional(),
  keywords: z
    .array(z.string({ invalid_type_error: 'Keyword must be string' }), {
      invalid_type_error: 'Keywords must be an array',
    })
    .optional(),
})

export const ProductValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be string',
    }),
    slug: z
      .string({
        required_error: 'Slug is required',
        invalid_type_error: 'Slug must be a string',
      })
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        'Invalid slug format. Use lowercase letters, numbers, and hyphens without consecutive or trailing hyphens'
      )
      .optional(),
    category: z
      .string({
        required_error: 'Category is required',
        invalid_type_error: 'Category must be a string',
      })
      .refine((arg) => Types.ObjectId.isValid(arg), {
        message: 'Invalid category _id',
      }),
    short_desc: z
      .string({
        required_error: 'Short description is required',
        invalid_type_error: 'Short description must be string',
      })
      .trim(),
    long_desc: z
      .string({
        required_error: 'Long description is required',
        invalid_type_error: 'Long description must be string',
      })
      .trim(),
    pricing: z.object(
      {
        basePrice: z
          .number({
            required_error: 'Base Price is required',
            invalid_type_error: 'Base Price must be number',
          })
          .min(0),
        finalPrice: z.number().optional(),
        discountPercentage: z
          .number({
            required_error: 'Discount Percentage is required',
            invalid_type_error: 'Discount Percentage must be number',
          })
          .min(0, { message: 'Min discount Percentage is 0' })
          .max(100, { message: 'Max discount Percentage is 100' })
          .default(0),
      },
      { required_error: 'Base Price is required' }
    ),
    brand: z.string({ invalid_type_error: 'Brand must be string' }).optional(),
    stock: z
      .number({
        required_error: 'Stock is required',
        invalid_type_error: 'Stock must be number',
      })
      .min(0, { message: 'Min stock is 0' }),
    sku: z
      .string({
        required_error: 'SKU is required',
        invalid_type_error: 'SKU must be string',
      })
      .trim(),
    tags: z.array(
      z.string({
        invalid_type_error: 'Tag must be string',
      }),
      {
        required_error: 'Tags is required',
        invalid_type_error: 'Tags must be array',
      }
    ),
    images: z.array(
      z
        .string({
          required_error: 'Image is required',
          invalid_type_error: 'Image must be a string',
        })
        .superRefine((value, ctx) => {
          if (!Types.ObjectId.isValid(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid media _id',
              path: ['images'],
            })
          }
        }),
      {
        required_error: 'Images is required',
        invalid_type_error: 'Images must be an array',
      }
    ),
    meta: MetaSchema.optional(),
    variants: VariantSchema.optional(),
    saleCategory: z
      .enum(
        [
          'none',
          'limited-time',
          'exclusive',
          'seasonal',
          'new-arrival',
          'best-deal',
          'best-seller',
        ],
        {
          invalid_type_error:
            "Must be a any of the values ('none', 'limited-time', 'exclusive', 'seasonal', 'new-arrival', best-deal', 'best-seller')",
        }
      )
      .default('none'),
  }),
})

export type IProductPayload = z.infer<typeof ProductValidationSchema>['body']

export type IVariant = z.infer<
  typeof ProductValidationSchema
>['body']['variants']
