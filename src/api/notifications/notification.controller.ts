import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { notificationService } from './notification.service'

class NotificationController {
  public async getAllNotifications(req: Request, res: Response) {
    const serviceRes = await notificationService.getAllNotifications()
    return sendServiceResponse(serviceRes, res)
  }

  public async markAsRead(req: Request, res: Response) {
    const { notificationId } = req.params
    const serviceRes = await notificationService.markAsRead(notificationId)
    return sendServiceResponse(serviceRes, res)
  }

  public async markAllAsRead(req: Request, res: Response) {
    const serviceRes = await notificationService.markAllAsRead()
    return sendServiceResponse(serviceRes, res)
  }

  public async deleteNotification(req: Request, res: Response) {
    const { notificationId } = req.params
    const serviceRes = await notificationService.deleteNotification(
      notificationId
    )
    return sendServiceResponse(serviceRes, res)
  }

  public async deleteAllNotifications(req: Request, res: Response) {
    const serviceRes = await notificationService.deleteAllNotifications()
    return sendServiceResponse(serviceRes, res)
  }
}

export const notificationController = new NotificationController()
