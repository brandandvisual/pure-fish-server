import { Router } from 'express'
import { messageController } from './message.controller'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { zodMessageSchema } from './message.zod-schema'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export const messageAdminRouter = Router()
export const messagePublicRouter = Router()

messageAdminRouter.use(authMiddleware.verifyAuthToken, authMiddleware.isAdmin)

messagePublicRouter.post('/send-message', [
  validateRequestPayload(zodMessageSchema),
  messageController.createMessage,
])

// Admin-only: get all messages (paginated)
messageAdminRouter.get('/fetch-all', messageController.getAllMessages)

// Admin-only: get a single message
messageAdminRouter.get('/:message_id/fetch', messageController.getSingleMessage)

// Admin-only: delete a message
messageAdminRouter.delete(
  '/:message_id/delete',
  messageController.deleteMessage
)

messageAdminRouter.patch('/:message_id/read', messageController.markAsRead)
