import { Router } from 'express'
import { notificationController } from './notification.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const notificationRouter = Router()

// Apply middleware to all routes in this router
notificationRouter.use(authMiddleware.verifyAuthToken, authMiddleware.isAdmin)

// Get all notifications
notificationRouter.get('/', notificationController.getAllNotifications)

// Mark a specific notification as read
notificationRouter.patch(
  '/:notificationId/read',
  notificationController.markAsRead
)

// Mark all notifications as read
notificationRouter.patch('/mark-all-read', notificationController.markAllAsRead)

// Delete a specific notification
notificationRouter.delete(
  '/:notificationId',
  notificationController.deleteNotification
)

// Delete all notifications
notificationRouter.delete('/', notificationController.deleteAllNotifications)
