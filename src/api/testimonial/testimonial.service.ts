import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { TestimonialModel } from './testimonial.model'
import { ITestimonialSchema } from './testimonial.zod-schema'

class TestimonialService {
  async createTestimonial(payload: ITestimonialSchema) {
    try {
      const newItem = await TestimonialModel.create(payload)
      return ServiceResponse.success(
        'Successfully created a testimonial',
        newItem,
        StatusCodes.CREATED
      )
    } catch (error) {
      console.log(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateTestimonial(testimonial_id: string, payload: ITestimonialSchema) {
    try {
      const updatedItem = await TestimonialModel.findByIdAndUpdate(
        testimonial_id,
        payload,
        { new: true }
      )
      return ServiceResponse.success(
        'Successfully update a testimonial',
        updatedItem,
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async toggleActiveTestimonial(testimonial_id: string) {
    try {
      const testimonial = await TestimonialModel.findById(testimonial_id)
      if (!testimonial) {
        return ServiceResponse.failure(
          'Testimonial not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      testimonial.isActive = !testimonial.isActive
      const updatedItem = await testimonial.save()

      return ServiceResponse.success(
        'Successfully update a testimonial',
        updatedItem,
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteTestimonial(testimonial_id: string) {
    try {
      const deletedItem = await TestimonialModel.findByIdAndDelete(
        testimonial_id
      )
      return ServiceResponse.success(
        'Successfully delete a testimonial',
        deletedItem,
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getSingleTestimonial(testimonial_id: string) {
    try {
      const item = await TestimonialModel.findById(testimonial_id)
      return ServiceResponse.success(
        'Successfully fetched a testimonial',
        item,
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getActiveTestimonials() {
    try {
      const items = await TestimonialModel.find({ isActive: true }).populate({
        path: 'avatar',
        model: 'Media',
        select: ['secure_url'],
      })
      return ServiceResponse.success(
        'Successfully fetched all active testimonials',
        items,
        StatusCodes.OK
      )
    } catch (error) {
      console.log(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllTestimonials(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit

      const [testimonials, totalCount] = await Promise.all([
        TestimonialModel.find()
          .populate({
            path: 'avatar',
            model: 'Media',
            select: ['secure_url'],
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        TestimonialModel.countDocuments(),
      ])

      const totalPages = Math.ceil(totalCount / limit)
      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }

      return ServiceResponse.success(
        'Successfully fetched all active testimonials',
        { testimonials, pagination },
        StatusCodes.OK,
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const testimonialService = new TestimonialService()
