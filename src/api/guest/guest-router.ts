import { Router } from 'express'
import { guestController } from './guest.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const guestRouter = Router()

guestRouter.get('/fetch-guests', [
  // authMiddleware.verifyAuthToken,
  // authMiddleware.isAdmin,
  guestController.getGuestCustomers,
])
