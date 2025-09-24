import { Request, Response } from 'express'
import { appContentService } from './app-content-service'
import { sendServiceResponse } from '@/common/utils/httpHandlers'

class AppContentController {
  public async createAppContent(req: Request, res: Response) {
    const payload = req.body
    const serviceRes = await appContentService.createAppContent(payload)
    return sendServiceResponse(serviceRes, res)
  }
  public async getAppContent(req: Request, res: Response) {
    const serviceRes = await appContentService.getAppContent()
    return sendServiceResponse(serviceRes, res)
  }

  public async getPolicyContent(req: Request, res: Response) {
    const serviceRes = await appContentService.getPolicyContent()
    return sendServiceResponse(serviceRes, res)
  }
}

export const appContentController = new AppContentController()