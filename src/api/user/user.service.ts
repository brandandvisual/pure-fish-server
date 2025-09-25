import { IRequest } from '@/common/middleware/auth.middleware'
import { ServiceResponse } from '@/common/models/serviceResponse'
import { smsManager } from '@/common/models/sms-manager'
import { convertToHash, createJWToken, generateOTP } from '@/common/utils'
import { env } from '@/common/utils/envConfig'
import { logger } from '@/server'
import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongoose'
import { z } from 'zod'
import { tokenService } from '../token/token.service'
import { UserModel } from './user.model'
import {
  IAddressPayload,
  IOTPPayload,
  IOTPPayloadPhone,
  ISigninPayload,
  ISignupPayload,
  ITokenPayload,
  IUpdatePasswordPayload,
  IUpdateProfilePayload,
} from './user.zod-schema'
import { email } from '@/common/models/email'

export class UserService {
  async createUser(body: ISignupPayload) {
    const queryObj: Record<string, any> = body.email
      ? { $or: [{ phone: body.phone }, { email: body.email }] }
      : { phone: body.phone }
    try {
      const isFound = await UserModel.exists(queryObj)
      if (isFound) {
        return ServiceResponse.failure(
          'Account already exists with the email or Phone',
          null,
          StatusCodes.CONFLICT
        )
      } else {
        const user = await UserModel.create({
          ...body,
          role: env.ADMIN_EMAIL === body.email ? 'admin' : 'user',
        })
        console.log(user, 'this is the user');
        const otp_code = generateOTP()
        await tokenService.createOTP(user._id as ObjectId, otp_code, 15)
        const info = await smsManager.sendMessage({
          to: body.phone,
          message: `Pure Fish OTP Code: ${otp_code}
Valid for 15 minutes. Use to verify your phone number.`,
        })
        if (info?.data?.request_id) {
          return ServiceResponse.success(
            'Registration Succesful. An OTP has been sent to your phone.',
            null,
            StatusCodes.CREATED
          )
        } else throw new Error('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.log(error)
      await UserModel.findOneAndDelete(queryObj)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async verifyEmail(payload: IOTPPayload) {
    try {
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

      const serviceRes = await tokenService.verifyOTP(
        user._id as ObjectId,
        payload.otp
      )

      if (!serviceRes.success) return serviceRes

      user.emailVerified = true
      await user.save()

      return ServiceResponse.success(
        'Email is successfully verified',
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

  async verifyPhone(payload: IOTPPayloadPhone) {
    try {
      const user = await UserModel.findOne({ phone: payload.phone })
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
          'Incorrect phone or Password',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const serviceRes = await tokenService.verifyOTP(
        user._id as ObjectId,
        payload.otp
      )

      if (!serviceRes.success) return serviceRes

      user.phoneVerified = true
      await user.save()

      return ServiceResponse.success(
        'Phone is successfully verified',
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

  async requestOTP(payload: ISigninPayload) {
    try {
      const user = await UserModel.findOne({ email: payload.email_phone })
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

      const otp_code = generateOTP()
      await tokenService.createOTP(user._id as ObjectId, otp_code, 15)
      const info = await email.sendEmail({
        to: user.email as string,
        subject: 'OTP Verification',
        html: email.OTPVerificationTemplate(otp_code, 15),
      })
      if (info.messageId) {
        return ServiceResponse.success(
          'An OTP has been sent to your email. Please check your inbox.',
          null,
          StatusCodes.OK
        )
      } else throw new Error('Email is failed sent')
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async signinByCredential(payload: ISigninPayload) {
    try {
      const isEmail = z.string().email().safeParse(payload.email_phone).success

      const queryObj = isEmail
        ? { email: payload.email_phone }
        : { phone: payload.email_phone }

      const user = await UserModel.findOne(queryObj).select([
        'fullName',
        'email',
        'phone',
        'role',
        'emailVerified',
        'phoneVerified',
        'isBanned',
        'address',
      ])

      if (!user) {
        return ServiceResponse.failure(
          'User is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      if (user.isBanned) {
        return ServiceResponse.failure(
          'Your account is banned. Please contact support',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (!user.phoneVerified) {
        return ServiceResponse.failure(
          'Your phone is not verified',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      await user.updateLastSignedIn()

      const accessToken = createJWToken({
        payload: {
          id: (user._id as ObjectId).toString(),
          phone: user.phone,
          role: user.role,
          variant: 'accessToken',
        },
        expiresIn: '1h',
      })

      const refreshToken = createJWToken({
        payload: {
          id: (user._id as ObjectId).toString(),
          phone: user.phone,
          role: user.role,
          variant: 'refreshToken',
        },
        expiresIn: '30d',
      })

      const tokens = await tokenService.createToken(
        user._id as ObjectId,
        {
          token: accessToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        {
          token: refreshToken,
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }
      )

      return ServiceResponse.success(
        'Signin Successful',
        {
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        StatusCodes.OK
      )
    } catch (error) {
      console.log(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  // async signinByGoogle(payload: IGoogleSignupPayload) {
  //   try {
  //     const user = await UserModel.findOne({
  //       email: payload.user.email,
  //     }).select([
  //       'fullName',
  //       'email',
  //       'phone',
  //       'provider',
  //       'role',
  //       'emailVerified',
  //       'isBanned',
  //     ])

  //     if (!user) {
  //       const userPayload: Partial<IUser> = {
  //         fullName: payload.user.name,
  //         email: payload.user.email,
  //         role: env.ADMIN_EMAIL === payload.user.email ? 'admin' : 'user',
  //         provider: payload.account.provider,
  //         image: payload.user.image,
  //         emailVerified: payload.profile.email_verified,
  //       }

  //       const newUser = await UserModel.create(userPayload)
  //       await newUser.updateLastSignedIn()

  //       await accountService.createAccount(
  //         newUser._id as string,
  //         payload.account
  //       )

  //       const accessToken = createJWToken({
  //         payload: {
  //           id: (newUser._id as ObjectId).toString(),
  //           email: newUser.email,
  //           role: newUser.role,
  //           variant: 'accessToken',
  //         },
  //         expiresIn: '1h',
  //       })

  //       const refreshToken = createJWToken({
  //         payload: {
  //           id: (newUser._id as ObjectId).toString(),
  //           email: newUser.email,
  //           role: newUser.role,
  //           variant: 'refreshToken',
  //         },
  //         expiresIn: '30d',
  //       })

  //       const tokens = await tokenService.createToken(
  //         newUser._id as ObjectId,
  //         {
  //           token: accessToken,
  //           expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  //         },
  //         {
  //           token: refreshToken,
  //           expiresAt: new Date(
  //             Date.now() + 30 * 24 * 60 * 60 * 1000
  //           ).toISOString(),
  //         }
  //       )

  //       return ServiceResponse.success(
  //         'Google signin successful',
  //         {
  //           user: newUser,
  //           accessToken: tokens.accessToken,
  //           refreshToken: tokens.refreshToken,
  //         },
  //         StatusCodes.OK
  //       )
  //     }

  //     if (user.provider !== 'google') {
  //       return ServiceResponse.failure(
  //         'You have already signed up   with another provider',
  //         null,
  //         StatusCodes.CONFLICT
  //       )
  //     }

  //     await user.updateLastSignedIn()
  //     await accountService.createAccount(user._id as string, payload.account)
  //     const accessToken = createJWToken({
  //       payload: {
  //         id: (user._id as ObjectId).toString(),
  //         email: user.email,
  //         role: user.role,
  //         variant: 'accessToken',
  //       },
  //       expiresIn: '1h',
  //     })

  //     const refreshToken = createJWToken({
  //       payload: {
  //         id: (user._id as ObjectId).toString(),
  //         email: user.email,
  //         role: user.role,
  //         variant: 'refreshToken',
  //       },
  //       expiresIn: '30d',
  //     })

  //     const tokens = await tokenService.createToken(
  //       user._id as ObjectId,
  //       {
  //         token: accessToken,
  //         expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  //       },
  //       {
  //         token: refreshToken,
  //         expiresAt: new Date(
  //           Date.now() + 30 * 24 * 60 * 60 * 1000
  //         ).toISOString(),
  //       }
  //     )
  //     return ServiceResponse.success(
  //       'Google signin successful',
  //       {
  //         user,
  //         accessToken: tokens.accessToken,
  //         refreshToken: tokens.refreshToken,
  //       },
  //       StatusCodes.OK
  //     )
  //   } catch (error) {
  //     return ServiceResponse.failure(
  //       'Internal server error',
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     )
  //   }
  // }

  async getSession(userId: string) {
    try {
      const user = await UserModel.findById(userId).select(['-password'])

      if (!user) {
        return ServiceResponse.failure(
          'User is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      await user.updateLastUsedIn()

      return ServiceResponse.success(
        'User session successfully retrived',
        user,
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

  // forgot password method
  async forgotPassword(payload: { identifier: string }) {
    try {
      const user = await UserModel.findOne({
        $or: [{ email: payload.identifier }, { phone: payload.identifier }]
      })

      // Generic message to prevent account enumeration
      const message = 'If account exists, check your email for reset instructions'

      if (!user) return ServiceResponse.success(message, null, StatusCodes.OK)

      // Create token
      const accessToken = createJWToken({
        payload: {
          id: (user._id as ObjectId).toString(),
          role: user.role,
          phone: user.phone,
          variant: 'accessToken',
        },
        expiresIn: '15m',
      })

      // Send email only if user has email
      if (user.email) {
        const info = await email.sendEmail({
          to: user.email,
          subject: 'Reset Password',
          html: email.resetPasswordTemplate('/reset-password', accessToken),
        })

        if (!info.messageId) throw new Error('Failed to send email')
      }

      return ServiceResponse.success(message, null, StatusCodes.OK)
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  // reset password method
  async resetPassword(userId: string, payload: IUpdatePasswordPayload) {
    try {
      const hashPassword = await convertToHash(payload.newPassword)
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { password: hashPassword } },
        { new: true }
      ).select(['-password'])

      if (!updatedUser) {
        return ServiceResponse.failure(
          "User not found or link expired",
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Password changed Successfully',
        updatedUser,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  // async checkVerifiedUser(payload: ISigninPayload) {
  //   try {
  //     const user = await UserModel.findOne({ email: payload.email })
  //     if (!user) {
  //       return ServiceResponse.failure(
  //         'Invalid email or password',
  //         null,
  //         StatusCodes.NOT_FOUND
  //       )
  //     }
  //     const isValid = await user.matchPassword(payload.password)

  //     if (!isValid) {
  //       return ServiceResponse.failure(
  //         'Invalid email or password',
  //         null,
  //         StatusCodes.NOT_FOUND
  //       )
  //     }

  //     if (user.emailVerified) {
  //       return ServiceResponse.success(
  //         'Email is verified! Procced to signin',
  //         { _id: user._id, emailVerified: user.emailVerified },
  //         StatusCodes.OK
  //       )
  //     } else {
  //       // send verification email
  //       const otp_code = generateOTP()
  //       await tokenService.createOTP(user._id as ObjectId, otp_code, 15)
  //       const info = await email.sendEmail({
  //         to: user.email,
  //         subject: 'OTP Verification',
  //         html: email.OTPVerificationTemplate(otp_code, 15),
  //       })
  //       if (info.messageId) {
  //         return ServiceResponse.failure(
  //           'An OTP has been sent to your email.',
  //           null,
  //           StatusCodes.FORBIDDEN
  //         )
  //       } else throw new Error('Email is faild to send')
  //     }
  //   } catch (error) {
  //     logger.error(error)
  //     return ServiceResponse.failure(
  //       'Internal server error',
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     )
  //   }
  // }

  async isPhoneVerified(payload: ISigninPayload) {
    const isEmail = z.string().email().safeParse(payload.email_phone).success
    const queryObj = isEmail
      ? { email: payload.email_phone }
      : { phone: payload.email_phone }

    try {
      const user = await UserModel.findOne(queryObj)
      if (!user) {
        return ServiceResponse.failure(
          'Invalid email or password',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const isValid = await user.matchPassword(payload.password)

      if (!isValid) {
        return ServiceResponse.failure(
          'Invalid email or password',
          null,
          StatusCodes.UNAUTHORIZED
        )
      }

      if (user.phoneVerified) {
        return ServiceResponse.success(
          'Phone is verified! Procced to signin',
          { _id: user._id, phoneVerified: user.phoneVerified },
          StatusCodes.OK
        )
      } else {
        const otp_code = generateOTP()
        await tokenService.createOTP(user._id as ObjectId, otp_code, 15)
        const info = await smsManager.sendMessage({
          to: user.phone,
          message: `Pure Fish OTP Code: ${otp_code}
Valid for 15 minutes. Use to verify your phone number.`,
        })
        if (info?.data?.request_id) {
          return ServiceResponse.failure(
            'Phone is not verified!.',
            { phone: user.phone },
            StatusCodes.FORBIDDEN
          )
        } else throw new Error('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updatePassword(req: Request, payload: IUpdatePasswordPayload) {
    try {
      const userId = (req as IRequest).userId
      const hashPassword = await convertToHash(payload.newPassword)
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: { password: hashPassword },
        },
        { new: true }
      ).select(['-password', '-otp'])

      console.log(ServiceResponse)
      return ServiceResponse.success(
        'Password changed Successfully',
        updatedUser,
        StatusCodes.OK
      )
    } catch (error) {
      console.log(error, 'here you can see the error message->')
      logger.error(error)
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateProfile(req: Request, payload: IUpdateProfilePayload) {
    const allowedFields = ['firstName', 'lastName', 'phone']
    const updateFields = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    )
    if (Object.keys(updateFields).length === 0) {
      return ServiceResponse.failure(
        'No valid fields provided to update',
        null,
        StatusCodes.BAD_REQUEST
      )
    }

    const userId = (req as IRequest).userId

    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: updateFields,
        },
        { new: true }
      ).select(['-password', '-otp'])

      return ServiceResponse.success(
        'Profile updated successfully',
        updatedUser,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateAddress(userId: string, payload: IAddressPayload) {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { address: payload } },
        { new: true }
      ).select(['-password'])

      return ServiceResponse.success(
        'Address updated successfully',
        updatedUser,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async createNewTokens({ refreshToken }: ITokenPayload) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET_KEY) as JwtPayload
      if (decoded?.variant !== 'refreshToken') {
        return ServiceResponse.failure(
          'Token must be an refresh token!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }
      const user = await UserModel.findById(decoded.id)
      if (!user) {
        return ServiceResponse.failure(
          'User is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const newAccessToken = createJWToken({
        payload: {
          id: (user._id as ObjectId).toString(),
          phone: user.phone,
          role: user.role,
          variant: 'accessToken',
        },
        expiresIn: '1h',
      })

      const newRefreshToken = createJWToken({
        payload: {
          id: (user._id as ObjectId).toString(),
          phone: user.phone,
          role: user.role,
          variant: 'refreshToken',
        },
        expiresIn: '30d',
      })

      const tokens = await tokenService.createToken(
        user._id as ObjectId,
        {
          token: newAccessToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        {
          token: newRefreshToken,
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }
      )

      return ServiceResponse.success(
        'Hurray! You got brand new tokens',
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      if (error instanceof JsonWebTokenError) {
        return ServiceResponse.failure(
          error.message,
          null,
          StatusCodes.BAD_REQUEST
        )
      }
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUsers(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit

      const [customers, admins, totalCustomers] = await Promise.all([
        UserModel.find({ role: 'user' }, '-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        UserModel.find({ role: { $in: ['admin', 'moderator'] } }, '-password'),
        UserModel.countDocuments({ role: 'user' }),
      ])

      const totalPages = Math.ceil(totalCustomers / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCustomers,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }

      return ServiceResponse.success(
        'Users data successfully retrived',
        { customers, admins, pagination },
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const userService = new UserService()