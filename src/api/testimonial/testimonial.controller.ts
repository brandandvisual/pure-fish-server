import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { testimonialService } from './testimonial.service'

class TestimonialController {
  async createTestimonial(req: Request, res: Response) {
    const payload = req.body
    const serviceResponse = await testimonialService.createTestimonial(payload)
    return sendServiceResponse(serviceResponse, res)
  }

  async updateTestimonial(req: Request, res: Response) {
    const payload = req.body
    const { testimonial_id } = req.params
    const serviceResponse = await testimonialService.updateTestimonial(
      testimonial_id,
      payload
    )
    return sendServiceResponse(serviceResponse, res)
  }

  async toggleActiveTestimonial(req: Request, res: Response) {
    const { testimonial_id } = req.params
    const serviceResponse = await testimonialService.toggleActiveTestimonial(
      testimonial_id
    )
    return sendServiceResponse(serviceResponse, res)
  }

  async deleteTestimonial(req: Request, res: Response) {
    const { testimonial_id } = req.params
    const serviceResponse = await testimonialService.deleteTestimonial(
      testimonial_id
    )
    return sendServiceResponse(serviceResponse, res)
  }

  async getSingleTestimonial(req: Request, res: Response) {
    const { testimonial_id } = req.params
    const serviceResponse = await testimonialService.getSingleTestimonial(
      testimonial_id
    )
    return sendServiceResponse(serviceResponse, res)
  }

  async getActiveTestimonials(req: Request, res: Response) {
    const serviceResponse = await testimonialService.getActiveTestimonials()
    return sendServiceResponse(serviceResponse, res)
  }

  async getAllTestimonials(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceResponse = await testimonialService.getAllTestimonials(
      page,
      limit
    )
    return sendServiceResponse(serviceResponse, res)
  }
}

export const testimonialController = new TestimonialController()
