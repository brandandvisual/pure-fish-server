import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { productService } from './product.service'

class ProductController {
  public async createProduct(req: Request, res: Response) {
    const serviceRes = await productService.createProduct(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async updateProduct(req: Request, res: Response) {
    const { product_id } = req.params
    const serviceRes = await productService.updateProduct(product_id, req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async deleteProduct(req: Request, res: Response) {
    const { product_id } = req.params
    const serviceRes = await productService.deleteProduct(product_id)
    return sendServiceResponse(serviceRes, res)
  }

  public async fetchAllProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceRes = await productService.fetchAllProducts(page, limit)
    return sendServiceResponse(serviceRes, res)
  }

  // public async getShopProducts(req: Request, res: Response) {
  //   const page = parseInt(req.query.page as string, 10) || 1
  //   const limit = parseInt(req.query.limit as string, 10) || 20
  //   const serviceRes = await productService.getShopProducts(page, limit)
  //   return sendServiceResponse(serviceRes, res)
  // }

  public async fetchBestSellerDealProducts(req: Request, res: Response) {
    const serviceRes = await productService.fetchBestSellerDealProducts()
    return sendServiceResponse(serviceRes, res)
  }

  public async getSingleProduct(req: Request, res: Response) {
    const { prod_slug_id } = req.params
    const serviceRes = await productService.getSingleProduct(prod_slug_id)
    return sendServiceResponse(serviceRes, res)
  }

  public async getProductsByCategory(req: Request, res: Response) {
    const { cat_slug } = req.params
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 16
    const serviceRes = await productService.getProductsByCategory(
      cat_slug,
      page,
      limit
    )
    return sendServiceResponse(serviceRes, res)
  }

  public async getRelatedProducts(req: Request, res: Response) {
    const { product_slug } = req.params
    const serviceRes = await productService.getRelatedProducts(product_slug, 8)
    return sendServiceResponse(serviceRes, res)
  }

  public async elasticSearch(req: Request, res: Response) {
    const query = req.query.query as string
    const serviceRes = await productService.elasticSearch(query)
    return sendServiceResponse(serviceRes, res)
  }
}

export const productController = new ProductController()
