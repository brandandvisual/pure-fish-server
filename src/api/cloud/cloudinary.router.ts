import { Router } from 'express'
import { cloudinaryController } from './cloudinary.controller'
import { fileMiddleware } from '@/common/middleware/file.middleware'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const cloudAdminRouter = Router()

cloudAdminRouter.post('/upload/image/product-images', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  fileMiddleware.singleImageUploader,
  cloudinaryController.uploadProductImage,
])

cloudAdminRouter.post('/upload/image/app-content', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  fileMiddleware.singleImageUploader,
  cloudinaryController.uploadProductImage,
])

cloudAdminRouter.get('/fetch/images', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAnyAdmin,
  cloudinaryController.getImageMedia,
])

cloudAdminRouter.delete('/delete-media/:media_id', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  cloudinaryController.deleteSingleMedia,
])
