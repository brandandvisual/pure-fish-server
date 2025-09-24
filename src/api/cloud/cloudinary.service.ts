import { ServiceResponse } from '@/common/models/serviceResponse'
import { env } from '@/common/utils/envConfig'
import { logger } from '@/server'
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary'
import { StatusCodes } from 'http-status-codes'
import { ObjectId, Schema } from 'mongoose'
import { MediaModel } from './media.model'

class CloudinaryService {
  constructor(cloud_name: string, api_key: string, api_secret: string) {
    cloudinary.config({ cloud_name, api_key, api_secret })
  }

  async uploadBuffer(
    buffer: Buffer<ArrayBufferLike>,
    options: UploadApiOptions
  ): Promise<UploadApiResponse | undefined> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ ...options }, (error, uploadResult) => {
          if (error) return reject(error)
          return resolve(uploadResult)
        })
        .end(buffer)
    })
  }

  async uploadSingleImage(
    userId: string,
    folder: string,
    file?: Express.Multer.File
  ) {
    let newMedia_id: ObjectId | null = null
    try {
      if (!file) {
        return ServiceResponse.failure(
          'Please select an image first!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const newMedia = await MediaModel.create({
        uploader: userId,
        originalName: file.originalname,
      })

      newMedia_id = newMedia._id as ObjectId

      const result = await this.uploadBuffer(file.buffer, {
        folder,
        resource_type: 'image',
        unique_filename: true,
        public_id: newMedia_id.toString(),
      })

      const updatedMedia = await MediaModel.findByIdAndUpdate(
        newMedia._id,
        result,
        { new: true }
      ).select(['originalName', 'secure_url', 'public_id'])

      return ServiceResponse.success(
        'Product image is uploaded successfully',
        updatedMedia
      )
    } catch (error) {
      if (newMedia_id) {
        await MediaModel.findByIdAndDelete(newMedia_id)
      }
      logger.error(error)
      return ServiceResponse.failure(
        'Image upload failed',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getImageMedia(page: number, limit: number, folder: string) {
    try {
      const skip = (page - 1) * limit

      const queryObj: Record<string, any> = {
        resource_type: 'image',
        format: { $ne: 'pdf' },
      }

      if (folder !== 'all-images') {
        queryObj.folder = folder
      }

      const [medias, totalCount] = await Promise.all([
        MediaModel.find(queryObj)
          .select(['originalName', 'secure_url', 'public_id'])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        MediaModel.countDocuments(queryObj),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }

      return ServiceResponse.success('Media fetched successfully', {
        medias,
        pagination,
      })
    } catch (error) {
      return ServiceResponse.failure(
        'Failed to fetch image medias',
        error,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteSingleMedia(media_id: Schema.Types.ObjectId | string) {
    try {
      const media = await MediaModel.findById(media_id)
      if (!media) {
        return ServiceResponse.failure(
          'Resource does not exists!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const { result } = await cloudinary.uploader.destroy(media.public_id, {
        invalidate: true,
        resource_type: media.resource_type,
        type: media.type,
      })

      if (result === 'ok') {
        await MediaModel.findByIdAndDelete(media_id)
        return ServiceResponse.success('Media is deleted successfully', null)
      } else {
        return ServiceResponse.failure(
          'Media is not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }
    } catch (error) {
      logger.error(error)
      return ServiceResponse.failure(
        'Failed to delete the Media',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const cloudinaryService = new CloudinaryService(
  env.CLOUDINARY_CLOUD_NAME,
  env.CLOUDINARY_API_KEY,
  env.CLOUDINARY_API_SECRET
)
