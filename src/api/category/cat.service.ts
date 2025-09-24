import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import { ProductModel } from '../product/product.model'
import { CategoryModel } from './cat.model'
import { ICatPayload } from './cat.zod-schema'

export class CategoryService {
  public async createCategory(payload: ICatPayload) {
    try {
      const category = await CategoryModel.exists({ title: payload.title })
      if (category) {
        return ServiceResponse.failure(
          'Category already exists! Title must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }
      const newCategory = await CategoryModel.create(payload)
      return ServiceResponse.success(
        'Category is created successfully',
        newCategory,
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

  public async updateCategory(cat_id: string, payload: ICatPayload) {
    try {
      if (!Types.ObjectId.isValid(cat_id)) {
        return ServiceResponse.failure(
          'Invalid category _id!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const [uniqueCatTitle, uniqueCatSlug] = await Promise.all([
        CategoryModel.exists({
          title: payload.title,
          _id: { $ne: cat_id },
        }),
        CategoryModel.exists({
          slug: payload.slug,
          _id: { $ne: cat_id },
        }),
      ])

      if (uniqueCatTitle) {
        return ServiceResponse.failure(
          'Category already exists! Title must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      if (uniqueCatSlug) {
        return ServiceResponse.failure(
          'Category already exists! Slug must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      const updatedCat = await CategoryModel.findByIdAndUpdate(
        cat_id,
        payload,
        { new: true }
      )

      return ServiceResponse.success(
        'Category is updated successfully',
        updatedCat,
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

  public async getCategory(slug: string) {
    try {
      const cat = await CategoryModel.findOne({ slug }).populate({
        path: 'image',
        model: 'Media',
        select: 'secure_url',
      })
      if (!cat) {
        return ServiceResponse.failure(
          'Category is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }
      return ServiceResponse.success(
        'Category is fetched successfully',
        cat,
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

  public async getAllCategories() {
    try {
      const cat = await CategoryModel.find()
        .populate({
          path: 'image',
          model: 'Media',
          select: 'secure_url',
        })
        .sort({ createdAt: -1 })

      return ServiceResponse.success(
        'Categories are fetched successfully',
        cat,
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

  public async deleteCategory(cat_id: string) {
    try {
      if (!Types.ObjectId.isValid(cat_id)) {
        return ServiceResponse.failure(
          'Invalid category _id!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const products = await ProductModel.find({ category: cat_id })

      if (products.length > 0) {
        return ServiceResponse.failure(
          'Cannot delete category. It is currently associated with one or more products.',
          null,
          StatusCodes.CONFLICT
        )
      }

      const cat = await CategoryModel.findByIdAndDelete(cat_id)

      if (!cat) {
        return ServiceResponse.failure(
          'Category is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Category is deleted successfully',
        cat,
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

export const catService = new CategoryService()
