import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import { CouponModel } from './coupon.model'
import { ICouponPayload } from './coupon.zod-schema'
import { OrderModel } from '../order/order.model'

class CouponService {
  async createCoupon(payload: ICouponPayload) {
    try {
      const newCoupon = await CouponModel.create(payload)
      return ServiceResponse.success(
        'Successfully created a coupon',
        newCoupon,
        StatusCodes.CREATED
      )
    } catch (error: any) {
      if (error?.code === 11000) {
        return ServiceResponse.failure(
          'Coupon code already exists',
          null,
          StatusCodes.CONFLICT
        )
      }
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateCoupon(couponId: string, payload: ICouponPayload) {
    try {
      if (!Types.ObjectId.isValid(couponId)) {
        return ServiceResponse.failure(
          'Invalid coupon _id',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const updatedCoupon = await CouponModel.findByIdAndUpdate(
        couponId,
        payload,
        { new: true }
      )
      if (!updatedCoupon) {
        return ServiceResponse.failure(
          'Coupon not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }
      return ServiceResponse.success(
        'Successfully updated the coupon',
        updatedCoupon,
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

  async deleteCoupon(couponId: string) {
    try {
      if (!Types.ObjectId.isValid(couponId)) {
        return ServiceResponse.failure(
          'Invalid coupon id',
          null,
          StatusCodes.BAD_REQUEST
        )
      }
      const deletedCoupon = await CouponModel.findByIdAndDelete(couponId)
      if (!deletedCoupon) {
        return ServiceResponse.failure(
          'Coupon not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }
      return ServiceResponse.success(
        'Successfully deleted the coupon',
        deletedCoupon,
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

  async validateCoupon(
    userId: string,
    payload: { promoCode: string; orderValue: number }
  ) {
    try {
      const { promoCode, orderValue } = payload
      const coupon = await CouponModel.findOne({ promoCode, isActive: true })

      if (!coupon) {
        return ServiceResponse.failure(
          'Invalid promo code',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (new Date(coupon.startDate) > new Date()) {
        return ServiceResponse.failure(
          'Coupon is not yet launched!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (new Date(coupon.expirationDate) < new Date()) {
        return ServiceResponse.failure(
          'Coupon has expired!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (orderValue < coupon.minimumOrderValue) {
        return ServiceResponse.failure(
          `Order value must be at least ${coupon.minimumOrderValue}`,
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      if (coupon.firstOrderOnly) {
        const orders = await OrderModel.find({ user: userId })
        if (orders.length > 0) {
          return ServiceResponse.failure(
            'Coupon is only valid for first order',
            null,
            StatusCodes.BAD_REQUEST
          )
        }
      }
      return ServiceResponse.success('This coupon is applicable', coupon)
    } catch (error) {
      console.log(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllCoupons() {
    try {
      const coupons = await CouponModel.find().sort({ createdAt: -1 })
      return ServiceResponse.success(
        'Successfully fetched all coupons',
        coupons,
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

  async getSingleCoupon(couponId: string) {
    try {
      if (!Types.ObjectId.isValid(couponId)) {
        return ServiceResponse.failure(
          'Invalid coupon id',
          null,
          StatusCodes.BAD_REQUEST
        )
      }
      const coupon = await CouponModel.findById(couponId)
      if (!coupon) {
        return ServiceResponse.failure(
          'Coupon not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }
      return ServiceResponse.success(
        'Successfully fetched the coupon',
        coupon,
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

export const couponService = new CouponService()
