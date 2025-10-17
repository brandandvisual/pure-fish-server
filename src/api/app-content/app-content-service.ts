import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { AppContentModel } from './app-content.model'
import { IAppContentPayload } from './app-content-zod-schema'

class AppContentService {
  async createAppContent(payload: IAppContentPayload) {
    try {
      const contents = await AppContentModel.find()
      if (contents && contents.length > 0) {
        const appContent = await AppContentModel.findByIdAndUpdate(
          contents[0]._id,
          payload,
          { new: true }
        )
        return ServiceResponse.success(
          'App content updated successfully',
          appContent
        )
      }
      const appContent = await AppContentModel.create(payload)
      return ServiceResponse.success(
        'App content created successfully',
        appContent,
        StatusCodes.CREATED
      )
    } catch (error) {
      console.log(error);
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
  async getAppContent() {
    try {
      const content = await AppContentModel.find()
        .populate('whyPureFish.image')

      if (content.length <= 0) {
        return ServiceResponse.failure(
          'App Content not found',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const data = content[0]
      return ServiceResponse.success(
        'Content fetched successfully',
        data,
        StatusCodes.OK
      )
    } catch (error) {
      console.error('Get AppContent Error:', error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getPolicyContent() {
    try {
      const content = await AppContentModel.find()
      if (content.length <= 0) {
        return ServiceResponse.failure(
          'App Content is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }
      const preRes: Partial<{
        privacyPolicy: string
        refundPolicy: string
        termsAndConditions: string
      }> = {}

      if (content[0]?.privacyPolicy)
        preRes.privacyPolicy = content[0].privacyPolicy

      if (content[0]?.refundPolicy)
        preRes.refundPolicy = content[0].refundPolicy

      if (content[0]?.termsAndConditions)
        preRes.termsAndConditions = content[0].termsAndConditions

      return ServiceResponse.success(
        'Content fetched successfully',
        preRes,
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
}
export const appContentService = new AppContentService()
