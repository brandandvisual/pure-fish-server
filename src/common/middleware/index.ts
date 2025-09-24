import { UserModel } from '@/api/user/user.model'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongoose'
import { ServiceResponse } from '../models/serviceResponse'
import { sendServiceResponse } from '../utils/httpHandlers'
import { IRequest } from './auth.middleware'


class Middleware {
  async isUserExist(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const user = await UserModel.findOne({ email })
      if (!user) {
        const serviceResponse = ServiceResponse.failure(
          'Incorrect or invalid email address',
          null,
          StatusCodes.NOT_FOUND
        )
        return sendServiceResponse(serviceResponse, res)
      }
      ;(req as IRequest).userId = (user._id as ObjectId).toString()
      ;(req as IRequest).role = user.role
      next()
    } catch (error) {
      const serviceResponse = ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
      return sendServiceResponse(serviceResponse, res)
    }
  }
}

export const middleware = new Middleware()
