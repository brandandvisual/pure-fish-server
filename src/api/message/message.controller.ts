import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { messageService } from './message.service'

class MessageController {
  async createMessage(req: Request, res: Response) {
    const payload = req.body
    const serviceResponse = await messageService.createMessage(payload)
    return sendServiceResponse(serviceResponse, res)
  }

  async getSingleMessage(req: Request, res: Response) {
    const { message_id } = req.params
    const serviceResponse = await messageService.getSingleMessage(message_id)
    return sendServiceResponse(serviceResponse, res)
  }

  async deleteMessage(req: Request, res: Response) {
    const { message_id } = req.params
    const serviceResponse = await messageService.deleteMessage(message_id)
    return sendServiceResponse(serviceResponse, res)
  }

  async getAllMessages(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceResponse = await messageService.getAllMessages(page, limit)
    return sendServiceResponse(serviceResponse, res)
  }

  public async markAsRead(req: Request, res: Response) {
    const { message_id } = req.params
    const serviceRes = await messageService.markAsRead(message_id)
    return sendServiceResponse(serviceRes, res)
  }
}

export const messageController = new MessageController()
