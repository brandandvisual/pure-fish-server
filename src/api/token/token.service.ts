import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongoose'
import { TokenModel } from './token.model'

class TokenService {
  public async createOTP(userId: ObjectId, otp_code: string, expire: number) {
    await TokenModel.deleteMany({ user: userId, type: 'otp' })
    const newToken = await TokenModel.create({
      user: userId,
      oneTimePass: {
        token: otp_code,
        expiresAt: new Date(Date.now() + expire * 60 * 1000).toISOString(),
      },
      type: 'otp',
    })
    return newToken
  }

  public async createToken(
    userId: ObjectId,
    accessToken: { token: string; expiresAt: string },
    refreshToken: { token: string; expiresAt: string }
  ) {
    await TokenModel.deleteMany({ user: userId, type: 'token' })
    const newToken = await TokenModel.create({
      user: userId,
      accessToken,
      refreshToken,
      type: 'token',
    })
    return newToken
  }

  public async verifyOTP(userId: ObjectId, otp_code: string) {
    try {
      const otpDoc = await TokenModel.findOne({
        user: userId,
        type: 'otp',
        isUsed: false,
      })
      if (!otpDoc) {
        return ServiceResponse.failure(
          'Invalid or expired OTP. Please request a new one.',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (otpDoc.oneTimePass && otpDoc.oneTimePass.expiresAt < new Date()) {
        return ServiceResponse.failure(
          'OTP has expired. Please request a new one.',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const isMatched = await otpDoc.compareOTP(otp_code)
      
      if (!isMatched) {
        return ServiceResponse.failure(
          'Invalid OTP. Please check the code and try again.',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      await TokenModel.findByIdAndDelete(otpDoc._id)

      return ServiceResponse.success(
        'OTP verified successfully.',
        null,
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const tokenService = new TokenService()
