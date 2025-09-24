import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validateRequestPayload } from '@/common/utils/httpHandlers'
import { Router } from 'express'
import { testimonialController } from './testimonial.controller'
import { zodTestimonialSchema } from './testimonial.zod-schema'

export const testimonialRouter = Router()

testimonialRouter.post('/create', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  validateRequestPayload(zodTestimonialSchema),
  testimonialController.createTestimonial,
])

testimonialRouter.delete('/:testimonial_id/delete', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  testimonialController.deleteTestimonial,
])

testimonialRouter.get('/all-active', [
  testimonialController.getActiveTestimonials,
])

testimonialRouter.get('/fetch-all', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  testimonialController.getAllTestimonials,
])

testimonialRouter.get('/:testimonial_id/fetch', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  testimonialController.getSingleTestimonial,
])

testimonialRouter.patch('/:testimonial_id/active', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  testimonialController.toggleActiveTestimonial,
])

testimonialRouter.post('/:testimonial_id/update', [
  authMiddleware.verifyAuthToken,
  authMiddleware.isAdmin,
  validateRequestPayload(zodTestimonialSchema),
  testimonialController.updateTestimonial,
])
