import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { MulterError } from 'multer'
import { ServiceResponse } from '../models/serviceResponse'
import { sendServiceResponse } from '../utils/httpHandlers'

class ErrorMiddleware {
  public notFound(req: Request, res: Response, next: NextFunction) {
    const serviceResponse = ServiceResponse.failure(
      'API route is not found!',
      null,
      StatusCodes.NOT_FOUND
    )
    return sendServiceResponse(serviceResponse, res)
  }

  public globalError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.locals.err = err
    // Handle Multer Error
    if (err instanceof MulterError) {
      const serviceResponse = ServiceResponse.failure(
        err.message,
        null,
        StatusCodes.BAD_REQUEST
      )
      return sendServiceResponse(serviceResponse, res)
    }
    // Handle all other error
    const serviceResponse = ServiceResponse.failure(
      err?.message || 'Internal server error',
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    )
    return sendServiceResponse(serviceResponse, res)
  }
}

export const errorMiddleware = new ErrorMiddleware()
