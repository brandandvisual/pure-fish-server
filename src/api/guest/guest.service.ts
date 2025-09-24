import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { GuestModel } from './guest.model'
import { IGuestPayload } from './guest.zod-schema'

export class GuestService {
  async createGuest(body: IGuestPayload) {
    try {
      const guest = await GuestModel.exists({ email: body.email })
      if (guest) {
        return ServiceResponse.success('Guest Account already stored', guest)
      } else {
        const newGuest = await GuestModel.create(body)
        if (newGuest) {
          return ServiceResponse.success('Guest Account created', newGuest)
        } else throw new Error('Server error')
      }
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getGuestCustomers(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit

      const [guests, totalCount] = await Promise.all([
        GuestModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        GuestModel.countDocuments(),
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
        'Guests data successfully retrived',
        { guests, pagination },
        StatusCodes.OK
      )
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server problem',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const guestService = new GuestService()
