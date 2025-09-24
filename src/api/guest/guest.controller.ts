import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { guestService } from './guest.service'

class GuestController {
  public async getGuestCustomers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceResponse = await guestService.getGuestCustomers(page, limit)
    return sendServiceResponse(serviceResponse, res)
  }
}

export const guestController = new GuestController()
