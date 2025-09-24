import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { couponService } from './coupon.service'
import { IRequest } from '@/common/middleware/auth.middleware'

class CouponController {
  async createCoupon(req: Request, res: Response) {
    const payload = req.body
    const serviceRes = await couponService.createCoupon(payload)
    return sendServiceResponse(serviceRes, res)
  }

  async updateCoupon(req: Request, res: Response) {
    const { couponId } = req.params
    const payload = req.body
    const serviceRes = await couponService.updateCoupon(couponId, payload)
    return sendServiceResponse(serviceRes, res)
  }

  async deleteCoupon(req: Request, res: Response) {
    const { couponId } = req.params
    const serviceRes = await couponService.deleteCoupon(couponId)
    return sendServiceResponse(serviceRes, res)
  }

  async validateCoupon(req: Request, res: Response) {
    const userId = (req as IRequest).userId
    const serviceRes = await couponService.validateCoupon(userId, req.body)
    return sendServiceResponse(serviceRes, res)
  }

  async getAllCoupons(req: Request, res: Response) {
    const serviceRes = await couponService.getAllCoupons()
    return sendServiceResponse(serviceRes, res)
  }

  async getSingleCoupon(req: Request, res: Response) {
    const { couponId } = req.params
    const serviceRes = await couponService.getSingleCoupon(couponId)
    return sendServiceResponse(serviceRes, res)
  }
}

export const couponController = new CouponController()
