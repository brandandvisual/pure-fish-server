import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { Router } from 'express'
import { couponController } from './coupon.controller'
import { zodCouponSchema, zodValidationCode } from './coupon.zod-schema'

export const couponAdminRouter = Router()
export const couponPublicRouter = Router()

// Create a new coupon (Admin only)
couponAdminRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(zodCouponSchema),
  couponController.createCoupon,
])

// Update an existing coupon (Admin only)
couponAdminRouter.patch('/:couponId/update', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(zodCouponSchema),
  couponController.updateCoupon,
])

// Delete a coupon (Admin only)
couponAdminRouter.delete('/:couponId/delete', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  couponController.deleteCoupon,
])

couponPublicRouter.post('/validate', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(zodValidationCode),
  couponController.validateCoupon,
])

// Fetch all coupons
couponAdminRouter.get('/fetch-all', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  couponController.getAllCoupons,
])

// Get a single coupon by ID (Admin only)
couponAdminRouter.get('/:couponId/fetch', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  couponController.getSingleCoupon,
])
