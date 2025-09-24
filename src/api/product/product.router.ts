import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { Router } from 'express'
import { productController } from './product.controller'
import { ProductValidationSchema } from './product.zod-schema'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const productAdminRouter = Router()
export const productPublicRouter = Router()

productAdminRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(ProductValidationSchema),
  productController.createProduct,
])

productAdminRouter.patch('/:product_id/update', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(ProductValidationSchema),
  productController.updateProduct,
])

productAdminRouter.delete('/:product_id/delete', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  productController.deleteProduct,
])

productAdminRouter.get('/fetch-all', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  productController.fetchAllProducts,
])

// productPublicRouter.get('/shop-products', productController.getShopProducts)

productAdminRouter.get(
  '/fetch/:prod_slug_id',
  productController.getSingleProduct
)

productPublicRouter.get(
  '/fetch-best-seller-deal',
  productController.fetchBestSellerDealProducts
)

productPublicRouter.get(
  '/fetch-products/:cat_slug',
  productController.getProductsByCategory
)

productPublicRouter.get(
  '/fetch-products/:product_slug/related',
  productController.getRelatedProducts
)

productPublicRouter.get('/search', productController.elasticSearch)
