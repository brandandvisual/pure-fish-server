import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { router } from '@/router'
import { Router } from 'express'
import { zodAppContentSchema } from './app-content-zod-schema'
import { appContentController } from './app-content-controller'

export const appContentRouter = Router()
// admin
appContentRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  validateRequestPayload(zodAppContentSchema),
  appContentController.createAppContent,
])

appContentRouter.get('/fetch', [appContentController.getAppContent])
appContentRouter.get('/policy-content', [appContentController.getPolicyContent])
