import { IRequest } from '@/common/middleware/auth.middleware'
import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { orderService } from './order.service'

class OrderController {
  public async createOrder(req: Request, res: Response) {
    const userId = (req as IRequest).userId
    const serviceRes = await orderService.createOrder(userId, req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async getUserOrderDetails(req: Request, res: Response) {
    const { order_id } = req.params
    const userId = (req as IRequest).userId
    const serviceRes = await orderService.getUserOrderDetails(order_id, userId)
    return sendServiceResponse(serviceRes, res)
  }

  public async getAdminOrderDetails(req: Request, res: Response) {
    const { order_id } = req.params
    const serviceRes = await orderService.getAdminOrderDetails(order_id)
    return sendServiceResponse(serviceRes, res)
  }

  public async getAllOrders(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceRes = await orderService.getAllOrders(page, limit)
    return sendServiceResponse(serviceRes, res)
  }

  public async getUserOrders(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const userId = (req as IRequest).userId
    const serviceRes = await orderService.getUserOrders(page, limit, userId)
    return sendServiceResponse(serviceRes, res)
  }

  public async updateOrderStatus(req: Request, res: Response) {
    const serviceRes = await orderService.updateOrderStatus(
      req.params.order_id,
      req.body,
      (req as IRequest).userId
    )
    return sendServiceResponse(serviceRes, res)
  }

  public async getOrderStatistics(req: Request, res: Response) {
    const serviceRes = await orderService.getOrderStatistics()
    return sendServiceResponse(serviceRes, res)
  }
}

export const orderController = new OrderController()
