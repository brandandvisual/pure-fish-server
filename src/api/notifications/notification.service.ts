import { ServiceResponse } from '@/common/models/serviceResponse'
import { INotificationPayload, NotificationModel } from './notification.model'
import { StatusCodes } from 'http-status-codes'
import { logger } from '@/server'

export class NotificationService {
  async createNotification(payload: INotificationPayload) {
    try {
      const notification = await NotificationModel.create(payload)

      return ServiceResponse.success(
        'Notification created successfully',
        notification,
        StatusCodes.CREATED
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to create notification',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllNotifications() {
    try {
      const [unreads, reads] = await Promise.all([
        NotificationModel.find({ isRead: false }).limit(10).sort({
          createdAt: -1,
        }),
        NotificationModel.find({ isRead: true }).limit(10).sort({
          createdAt: -1,
        }),
      ])

      const notifications = unreads.concat(reads).slice(0, 10)

      return ServiceResponse.success(
        'Notifications fetched successfully',
        notifications,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to fetch notifications',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getNotificationById(id: string) {
    try {
      const notification = await NotificationModel.findById(id)

      if (!notification) {
        return ServiceResponse.failure(
          'Notification not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Notification fetched successfully',
        notification,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to fetch notification',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async markAsRead(id: string) {
    try {
      const updated = await NotificationModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      )

      if (!updated) {
        return ServiceResponse.failure(
          'Notification not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Notification marked as read',
        updated,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to update notification',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteNotification(id: string) {
    try {
      const deleted = await NotificationModel.findByIdAndDelete(id)

      if (!deleted) {
        return ServiceResponse.failure(
          'Notification not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Notification deleted successfully',
        deleted,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to delete notification',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async markAllAsRead() {
    try {
      const result = await NotificationModel.updateMany(
        { isRead: false },
        { isRead: true }
      )

      return ServiceResponse.success(
        'All notifications marked as read',
        result,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to mark notifications as read',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteAllNotifications() {
    try {
      const result = await NotificationModel.deleteMany({})

      return ServiceResponse.success(
        'All notifications deleted',
        result,
        StatusCodes.OK
      )
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to delete notifications',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const notificationService = new NotificationService()
