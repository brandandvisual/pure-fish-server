import { UserModel } from '@/api/user/user.model'
import { logger } from '@/server'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { ServiceResponse } from '../models/serviceResponse'
import { env } from '../utils/envConfig'
import { sendServiceResponse } from '../utils/httpHandlers'

export interface IRequest extends Request {
  userId: string
  role: 'admin' | 'moderator' | 'user'
}

class AuthMiddleware {
  async verifyAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        const serviceRes = ServiceResponse.failure(
          'Access denied. User must be logged in.',
          null,
          StatusCodes.UNAUTHORIZED
        )
        return sendServiceResponse(serviceRes, res)
      }
      const accessToken = token.split(' ')[1]
      const decoded = jwt.verify(accessToken, env.JWT_SECRET_KEY) as JwtPayload

      if (decoded?.variant !== 'accessToken') {
        const serviceRes = ServiceResponse.failure(
          'Token must be an access token!',
          null,
          StatusCodes.BAD_REQUEST
        )
        return sendServiceResponse(serviceRes, res)
      }
      const user = await UserModel.findById(decoded?.id)

      if (!user) {
        const serviceRes = ServiceResponse.failure(
          'Access denied. User must be logged in.',
          null,
          StatusCodes.NOT_FOUND
        )
        return sendServiceResponse(serviceRes, res)
      }
      ;(req as IRequest).userId = decoded.id
      ;(req as IRequest).role = decoded.role
      next()
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.name === 'TokenExpiredError') {
          const serviceRes = ServiceResponse.failure(
            'Access denied. User must be logged in.',
            { code: 'TokenExpiredError' },
            StatusCodes.UNAUTHORIZED
          )
          return sendServiceResponse(serviceRes, res)
        }
      }

      const serviceRes = ServiceResponse.failure(
        'Internal Server Error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
      return sendServiceResponse(serviceRes, res)
    }
  }

  async isModerator(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req as IRequest
      if (role !== 'moderator') throw new Error('Unauthorized access')
      next()
    } catch (error) {
      const serviceResponse = ServiceResponse.failure(
        'Access denied. Moderator only.',
        null,
        StatusCodes.FORBIDDEN
      )
      return sendServiceResponse(serviceResponse, res)
    }
  }

  async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req as IRequest
      if (role !== 'admin') throw new Error('Unauthorized access')
      next()
    } catch (error) {
      const serviceResponse = ServiceResponse.failure(
        'Access denied. Admins only.',
        null,
        StatusCodes.FORBIDDEN
      )
      return sendServiceResponse(serviceResponse, res)
    }
  }

  async isAnyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req as IRequest
      if (role === 'user') throw new Error('Unauthorized access')
      next()
    } catch (error) {
      const serviceResponse = ServiceResponse.failure(
        'Access denied. Admins & Moderators only.',
        null,
        StatusCodes.FORBIDDEN
      )
      return sendServiceResponse(serviceResponse, res)
    }
  }

  async verifyCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body
      const user = await UserModel.findOne({ email: payload.email })
      if (!user) {
        return ServiceResponse.failure(
          'User is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const isMatched = await user.matchPassword(payload.password)

      if (!isMatched) {
        return ServiceResponse.failure(
          'Incorrect E-mail or Password',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      next()
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const authMiddleware = new AuthMiddleware()
