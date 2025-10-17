import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { catService } from './cat.service'

class CategoryController {
  public async createCategory(req: Request, res: Response) {
    const serviceRes = await catService.createCategory(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async updateCategory(req: Request, res: Response) {
    const { cat_id } = req.params
    const serviceRes = await catService.updateCategory(cat_id, req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async getCategory(req: Request, res: Response) {
    const { slug } = req.params
    const serviceRes = await catService.getCategory(slug)
    return sendServiceResponse(serviceRes, res)
  }

  public async getAllCategories(req: Request, res: Response) {

    const serviceRes = await catService.getAllCategories()
    return sendServiceResponse(serviceRes, res)
  }

  public async deleteCategory(req: Request, res: Response) {
    const { cat_id } = req.params
    const serviceRes = await catService.deleteCategory(cat_id)
    return sendServiceResponse(serviceRes, res)
  }
}

export const catController = new CategoryController()
