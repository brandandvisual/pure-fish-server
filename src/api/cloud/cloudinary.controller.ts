import { IRequest } from '@/common/middleware/auth.middleware'
import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { cloudinaryService } from './cloudinary.service'

class CloudinaryController {
  async uploadProductImage(req: Request, res: Response) {
    const serviceRes = await cloudinaryService.uploadSingleImage(
      (req as IRequest).userId,
      'product-images',
      req.file
    )
    return sendServiceResponse(serviceRes, res)
  }

  
  async uploadAppContentImage(req: Request, res: Response) {
    const serviceRes = await cloudinaryService.uploadSingleImage(
      (req as IRequest).userId,
      'app-content',
      req.file
    )
    return sendServiceResponse(serviceRes, res)
  }
  

  async deleteSingleMedia(req: Request, res: Response) {
    const { media_id } = req.params
    const serviceRes = await cloudinaryService.deleteSingleMedia(media_id)
    return sendServiceResponse(serviceRes, res)
  }

  async getImageMedia(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const folder = (req.query.folder as string) || 'all-images'
    const serviceRes = await cloudinaryService.getImageMedia(
      page,
      limit,
      folder
    )
    return sendServiceResponse(serviceRes, res)
  }
}

export const cloudinaryController = new CloudinaryController()
