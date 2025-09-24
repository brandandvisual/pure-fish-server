import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { Router } from 'express'
import { catController } from './cat.controller'
import { CatValidationSchema } from './cat.zod-schema'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const catAdminRouter = Router()
export const catPublicRouter = Router()

catAdminRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(CatValidationSchema),
  catController.createCategory,
])

catAdminRouter.put('/:cat_id/update', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  validateRequestPayload(CatValidationSchema),
  catController.updateCategory,
])

catAdminRouter.delete('/:cat_id/delete', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  catController.deleteCategory,
])

catPublicRouter.get('/fetch-all', catController.getAllCategories)
catPublicRouter.get('/fetch/:slug', catController.getCategory)
