import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ServiceResponseSchema } from '@/common/models/serviceResponse'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  statusCode = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema),
        },
      },
    },
  }
}

export function createRequestBody(ref: string) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${ref}` },
      },
    },
  }
}

// Use if you want multiple responses for a single endpoint

// import { ResponseConfig } from '@asteasolutions/zod-to-openapi';
// import { ApiResponseConfig } from '@common/models/openAPIResponseConfig';
// export type ApiResponseConfig = {
//   schema: z.ZodTypeAny;
//   description: string;
//   statusCode: StatusCodes;
// };
// export function createApiResponses(configs: ApiResponseConfig[]) {
//   const responses: { [key: string]: ResponseConfig } = {};
//   configs.forEach(({ schema, description, statusCode }) => {
//     responses[statusCode] = {
//       description,
//       content: {
//         'application/json': {
//           schema: ServiceResponseSchema(schema),
//         },
//       },
//     };
//   });
//   return responses;
// }
