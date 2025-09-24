import { authMiddleware } from '@/common/middleware/auth.middleware'
import { Router } from 'express'
import { orderController } from './order.controller'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { OrderValidationSchema, zodOrderStatusSchema } from './order.zod-schema'

export const orderAdminRouter = Router()
export const orderUserRouter = Router()

orderUserRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  validateRequestPayload(OrderValidationSchema),
  orderController.createOrder,
])

orderAdminRouter.get('/fetch-all', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  orderController.getAllOrders,
])

orderUserRouter.get('/user-orders', [
  authMiddleware.verifyAuthToken,
  orderController.getUserOrders,
])

orderUserRouter.get('/:order_id/order-details-user', [
  authMiddleware.verifyAuthToken,
  orderController.getUserOrderDetails,
])

orderAdminRouter.get('/:order_id/order-details-admin', [
  // authMiddleware.verifyAuthToken,
  // authMiddleware.isAnyAdmin,
  orderController.getAdminOrderDetails,
])

orderAdminRouter.patch('/:order_id/update-order-status', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(zodOrderStatusSchema),
  orderController.updateOrderStatus,
])

orderAdminRouter.get('/dashboard-stats', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  orderController.getOrderStatistics,
])
