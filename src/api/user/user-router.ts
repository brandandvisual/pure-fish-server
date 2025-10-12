import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { Router } from 'express'
import { userController } from './user.controller'
import {
  otpSchema,
  otpSchemaPhone,
  signinSchema,
  signupSchema,
  zodAddressSchema,
  zodForgotPassSchema,
  zodResetPassSchema,
  zodTokenSchema,
  zodUpdatePasswordSchema,
  zodUpdateProfileSchema,
} from './user.zod-schema'

export const userRouter = Router()
export const userAdminRouter = Router()
export const authRouter = Router()

// Auth router
authRouter.post('/signup', [
  validateRequestPayload(signupSchema),
  userController.signup,
])

authRouter.post('/verify-email', [
  validateRequestPayload(otpSchema),
  userController.verifyEmail,
])

authRouter.post('/verify-phone', [
  validateRequestPayload(otpSchemaPhone),
  userController.verifyPhone,
])

authRouter.post('/request-otp', [
  validateRequestPayload(signinSchema),
  userController.requestOTP,
])

authRouter.post('/signin/credential', [
  validateRequestPayload(signinSchema),
  userController.signinByCredential,
])

// authRouter.post('/signin/google', [
//   validateRequestPayload(googleSignupSchema),
//   userController.signinByGoogle,
// ])

authRouter.get('/session', [
  authMiddleware.verifyAuthToken,
  userController.getSession,
])

authRouter.patch('/forgot-password', [
  validateRequestPayload(zodForgotPassSchema),
  userController.forgotPassword,
])

authRouter.patch('/reset-password', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(zodResetPassSchema),
  userController.resetPassword,
])

// authRouter.post('/check-verified-user', [
//   validateRequestPayload(signinSchema),
//   userController.checkVerifiedUser,
// ])

authRouter.post('/is-phone-verified', [
  validateRequestPayload(signinSchema),
  userController.isPhoneVerified,
])

authRouter.post('/token/refresh', [
  validateRequestPayload(zodTokenSchema),
  userController.createNewTokens,
])

// user router
userRouter.patch('/update-password', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(zodUpdatePasswordSchema),
  userController.updatePassword,
])

// userRouter.get('/profile', [
//   authMiddleware.verifyAuthToken,
//   userController.getUser,
// ])

userRouter.patch('/update-profile', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(zodUpdateProfileSchema),
  userController.updateProfile,
])

userRouter.patch('/update-address', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(zodAddressSchema),
  userController.updateAddress,
])

userAdminRouter.get('/fetch-users', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  userController.getUsers,
])
