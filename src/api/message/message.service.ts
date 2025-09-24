import { email } from '@/common/models/email'
import { ServiceResponse } from '@/common/models/serviceResponse'
import { env } from '@/common/utils/envConfig'
import { StatusCodes } from 'http-status-codes'
import { IMessagePayload } from './message.zod-schema'
import { MessageModel } from './message.model'

class MessageService {
  // helper fuction to send a message
  async sendMessage(payload: IMessagePayload) {
    const result = await email.sendEmail({
      to: env.SUPPORT_EMAIL,
      subject: 'New Public Message',
      html: email.publicMessageTemplate(payload),
    })
    return result
  }

  // service function
  async createMessage(payload: IMessagePayload) {
    try {
      const newItem = await MessageModel.create(payload)

      // send email after creating a message
      await this.sendMessage(payload)

      return ServiceResponse.success(
        'Successfully sent a message',
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

  async getSingleMessage(message_id: string) {
    try {
      const item = await MessageModel.findById(message_id)
      return ServiceResponse.success(
        'Successfully fetched a message',
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

  async deleteMessage(message_id: string) {
    try {
      const deletedItem = await MessageModel.findByIdAndDelete(message_id)
      return ServiceResponse.success(
        'Successfully deleted a message',
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

  async getAllMessages(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit

      const [messages, totalCount] = await Promise.all([
        MessageModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        MessageModel.countDocuments(),
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
        'Successfully fetched all messages',
        { messages, pagination },
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

  async markAsRead(message_id: string) {
    try {
      const updated = await MessageModel.findByIdAndUpdate(
        message_id,
        { isRead: true },
        { new: true }
      )

      if (!updated) {
        return ServiceResponse.failure(
          'Message not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Message marked as read',
        updated,
        StatusCodes.OK
      )
    } catch (error) {
      console.error(error)
      return ServiceResponse.failure(
        'Failed to update notification',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const messageService = new MessageService()
