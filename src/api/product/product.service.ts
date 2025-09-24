import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { isValidObjectId, PipelineStage, Types } from 'mongoose'
import { CategoryModel } from '../category/cat.model'
import { ProductModel } from './product.model'
import { IProductPayload } from './product.zod-schema'
import { OrderModel } from '../order/order.model'
import { getDiscountPrice } from '@/common/utils'

export class ProductService {
  public async createProduct(payload: IProductPayload) {
    try {
      const [uniqueProdTitle, uniqueProdSKU] = await Promise.all([
        ProductModel.exists({
          title: payload.title,
        }),
        ProductModel.exists({
          sku: payload.sku,
        }),
      ])

      if (uniqueProdTitle) {
        return ServiceResponse.failure(
          'Product already exists! Title must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      if (uniqueProdSKU) {
        return ServiceResponse.failure(
          'Product already exists! SKU must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      const newProduct = await ProductModel.create(payload)
      return ServiceResponse.success(
        'Product is created successfully',
        newProduct,
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

  public async updateProduct(product_id: string, payload: IProductPayload) {
    try {
      if (!Types.ObjectId.isValid(product_id)) {
        return ServiceResponse.failure(
          'Invalid product _id!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }
      const [uniqueProdTitle, uniqueProdSlug, uniqueProdSKU] =
        await Promise.all([
          ProductModel.exists({
            title: payload.title,
            _id: { $ne: product_id },
          }),
          ProductModel.exists({
            slug: payload.slug,
            _id: { $ne: product_id },
          }),
          ProductModel.exists({
            sku: payload.sku,
            _id: { $ne: product_id },
          }),
        ])

      if (uniqueProdTitle) {
        return ServiceResponse.failure(
          'Product already exists! Title must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      if (uniqueProdSlug) {
        return ServiceResponse.failure(
          'Product already exists! Slug must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      if (uniqueProdSKU) {
        return ServiceResponse.failure(
          'Product already exists! SKU must be unique.',
          null,
          StatusCodes.CONFLICT
        )
      }

      const product = await ProductModel.findByIdAndUpdate(
        product_id,
        {
          ...payload,
          pricing: {
            ...payload.pricing,
            finalPrice: getDiscountPrice(
              payload.pricing.basePrice,
              payload.pricing?.discountPercentage || 0
            ),
          },
        },
        { new: true }
      )
      if (!product) {
        return ServiceResponse.failure(
          'Product is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Product is updated successfully',
        product,
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

  public async deleteProduct(product_id: string) {
    try {
      if (!Types.ObjectId.isValid(product_id)) {
        return ServiceResponse.failure(
          'Inavlid Product _id',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const isProductInOrder = await OrderModel.exists({
        'products.product': product_id,
      })

      if (isProductInOrder) {
        return ServiceResponse.failure(
          'Product cannot be deleted because it exists in an order.',
          null,
          StatusCodes.CONFLICT
        )
      }

      const product = await ProductModel.findByIdAndDelete(product_id)

      if (!product) {
        return ServiceResponse.failure(
          'Product is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Product is deleted successfully',
        product,
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

  public async fetchAllProducts(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit

      const [products, totalCount] = await Promise.all([
        ProductModel.find()
          .populate({
            path: 'category',
            model: 'Category',
            select: 'title slug',
          })
          .populate({
            path: 'images',
            model: 'Media',
            select: 'secure_url',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ProductModel.countDocuments(),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }

      return ServiceResponse.success(
        `Page ${page} products fetched successfully`,
        { products, pagination },
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

  public async fetchBestSellerDealProducts() {
    try {
      const [bestSellerProducts, bestDealProducts] = await Promise.all([
        ProductModel.find({ saleCategory: 'best-seller' }, 'pricing title slug')
          .populate({
            path: 'images',
            model: 'Media',
            select: ['secure_url'],
          })
          .populate({
            path: 'category',
            model: 'Category',
            select: ['title', 'slug'],
          })
          .sort({ createdAt: -1 }),
        ProductModel.find({ saleCategory: 'best-deal' })
          .populate({
            path: 'images',
            model: 'Media',
            select: ['secure_url'],
          })
          .populate({
            path: 'category',
            model: 'Category',
            select: ['title', 'slug'],
          })
          .sort({ createdAt: -1 }),
      ])

      return ServiceResponse.success(
        `products fetched successfully`,
        { bestSellerProducts, bestDealProducts },
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

  public async getSingleProduct(prod_slug_id: string) {
    try {
      const query = isValidObjectId(prod_slug_id)
        ? { _id: prod_slug_id }
        : { slug: prod_slug_id }
      const product = await ProductModel.findOne(query)
        .populate({
          path: 'images',
          model: 'Media',
          select: ['secure_url'],
        })
        .populate({
          path: 'category',
          model: 'Category',
          populate: {
            path: 'image',
            model: 'Media',
            select: ['secure_url'],
          },
        })

      if (!product) {
        return ServiceResponse.failure(
          'Product is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        `Product fetched successfully`,
        product,
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

  public async getProductsByCategory(
    cat_slug: string,
    page: number,
    limit: number
  ) {
    try {
      if (cat_slug === 'all-products') {
        const allProducts = await this.getShopProducts(
          page,
          limit,
          {},
          'Shop Products'
        )
        return allProducts
      }

      const category = await CategoryModel.findOne({ slug: cat_slug })
      if (!category) {
        return ServiceResponse.failure(
          'Category is not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const allProducts = await this.getShopProducts(
        page,
        limit,
        { category: category._id },
        category.title
      )
      return allProducts
    } catch (error) {
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getRelatedProducts(product_slug: string, limit: number) {
    try {
      const product = await ProductModel.findOne({ slug: product_slug })

      if (!product) {
        return ServiceResponse.failure(
          'Product not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      const pipeline: PipelineStage[] = [
        { $match: { _id: { $ne: product._id } } },
        {
          $addFields: {
            tagMatches: {
              $size: { $setIntersection: ['$tags', product.tags || []] },
            },
            categoryMatchScore: {
              $cond: [{ $eq: ['$category', product.category] }, 1, 0],
            },
            saleCategoryMatchScore: {
              $cond: [{ $eq: ['$saleCategory', product.saleCategory] }, 1, 0],
            },
          },
        },
        {
          $addFields: {
            totalScore: {
              $add: [
                { $multiply: ['$categoryMatchScore', 4] },
                { $multiply: ['$tagMatches', 2] },
                { $multiply: ['$saleCategoryMatchScore', 1] },
              ],
            },
          },
        },
        { $sort: { totalScore: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: 'media',
            localField: 'images',
            foreignField: '_id',
            pipeline: [
              { $project: { public_id: 1, originalName: 1, secure_url: 1 } },
            ],
            as: 'images',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            pipeline: [{ $project: { title: 1, slug: 1 } }],
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $project: { title: 1, slug: 1, pricing: 1, images: 1, category: 1 } },
      ]

      // Optional: Boost with text search if tags are available
      if (product.tags && product.tags.length > 0) {
        pipeline.unshift({
          $match: {
            $text: { $search: product.tags.join(' ') },
          },
        })
      }

      const relatedProducts = await ProductModel.aggregate(pipeline)

      return ServiceResponse.success(
        'Related products fetched successfully',
        relatedProducts
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

  public async elasticSearch(query = '', limit = 10) {
    try {
      if (!query) {
        return ServiceResponse.failure(
          'Please send a query text',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const products = await ProductModel.find(
        { $text: { $search: query.trim() } },
        { score: { $meta: 'textScore' } }
      )

        .populate('category', 'title slug')
        .populate('images', 'secure_url')
        .limit(limit)
        .sort({ score: { $meta: 'textScore' } })

      return ServiceResponse.success('Products found successfully!', products)
    } catch (error) {
      console.error(error)
      return ServiceResponse.failure(
        'Internal server error',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getShopProducts(
    page: number,
    limit: number,
    queryObj = {},
    title: string
  ) {
    try {
      const skip = (page - 1) * limit

      const [products, totalCount] = await Promise.all([
        ProductModel.find(queryObj, 'pricing title slug')
          .populate({
            path: 'category',
            model: 'Category',
            select: 'title slug',
          })
          .populate({
            path: 'images',
            model: 'Media',
            select: 'secure_url',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ProductModel.countDocuments(),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }

      return ServiceResponse.success(
        `Page ${page} products fetched successfully`,
        { products, pagination, pageTitle: title },
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

export const productService = new ProductService()
