import { ServiceResponse } from '@/common/models/serviceResponse'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { ZodError, ZodSchema } from 'zod'

export const sendServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse)
}

export const validateRequestPayload =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params })
      next()
    } catch (err) {
      const errors: { [key: string]: string } = {};
      (err as ZodError).errors.forEach((e) => {
        errors[e.path.at(-1)!] = e.message
      })
      const serviceResponse = ServiceResponse.failure(
        'Bad Request',
        errors,
        StatusCodes.BAD_REQUEST
      )
      return sendServiceResponse(serviceResponse, res)
    }
  }
