import { ServiceResponse } from '@/common/models/serviceResponse'
import { StatusCodes } from 'http-status-codes'
import { ObjectId, Types } from 'mongoose'
import { OrderModel } from './order.model'
import { IOrderPayload, IOrderStatusPayload } from './order.zod-schema'
import { ProductModel } from '../product/product.model'
import { CouponModel } from '../coupon/coupon.model'
import { createUniqueTransaction } from '@/common/utils'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

class OrderService {
  async createOrder(userId: string, payload: IOrderPayload) {
    try {
      // Validate products and calculate subtotal
      const productIds = payload.products.map((p) => p.product)
      const products = await ProductModel.find({ _id: { $in: productIds } })

      if (products.length !== payload.products.length) {
        return ServiceResponse.failure(
          'One or more products not found',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      // Check product availability and calculate subtotal
      let subtotal = 0
      const productUpdates: {
        updateOne: {
          filter: { _id: string }
          update: { $inc: { stock: number } }
        }
      }[] = []

      products.forEach((product) => {
        const reqProduct = payload.products.find(
          (p) => p.product === (product._id as ObjectId).toString()
        )
        if (!reqProduct) return
        if (product.stock < reqProduct.quantity) {
          return ServiceResponse.failure(
            `Insufficient stock for product ${product.title}`,
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        const price = product.pricing.finalPrice || product.pricing.basePrice
        subtotal += price * reqProduct.quantity

        productUpdates.push({
          updateOne: {
            filter: { _id: product._id as string },
            update: { $inc: { stock: -reqProduct.quantity } },
          },
        })
      })

      let discountAmount = 0
      let coupon = null

      if (payload.coupon) {
        if (!Types.ObjectId.isValid(payload.coupon)) {
          return ServiceResponse.failure(
            'Invalid coupon _id',
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        coupon = await CouponModel.findById(payload.coupon)

        if (!coupon) {
          return ServiceResponse.failure(
            'Invalid promo code',
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        if (new Date(coupon.startDate) > new Date()) {
          return ServiceResponse.failure(
            'Coupon is not yet launched! Talk to support',
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        if (new Date(coupon.expirationDate) < new Date()) {
          return ServiceResponse.failure(
            'Coupon has expired!',
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        if (subtotal < coupon.minimumOrderValue) {
          return ServiceResponse.failure(
            `Order value must be at least ${coupon.minimumOrderValue} to get this promo discount`,
            null,
            StatusCodes.BAD_REQUEST
          )
        }

        if (coupon.firstOrderOnly) {
          const prev_orders = await OrderModel.countDocuments({ user: userId })
          if (prev_orders > 0) {
            return ServiceResponse.failure(
              'Ops! This Coupon is only applicable for first order',
              null,
              StatusCodes.BAD_REQUEST
            )
          }
        }

        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100
        } else {
          discountAmount = coupon.discountValue
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal)
      }

      // 4. Calculate final amount (subtotal - discount + shipping)
      const shippingFee = 100

      const finalAmount = Math.ceil(subtotal - discountAmount) + shippingFee

      const transactionId = createUniqueTransaction(userId)

      // 5. Create payment details
      const paymentDetails = {
        gateway: payload.paymentMethod === 'sslcommerz' ? 'SSLCommerz' : 'COD',
        paymentMethod: payload.paymentMethod,
        amount: finalAmount,
        currency: 'BDT',
        transactionId,
      }

      // 6. Create the order
      const order = new OrderModel({
        user: userId,
        products: payload.products,
        shippingAddress: payload.shippingAddress,
        billingAddress: payload.billingAddress || payload.shippingAddress,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
        subtotal,
        discountAmount,
        shippingFee,
        finalAmount,
        coupon: coupon?._id,
        promoCode: coupon?.promoCode,
        paymentDetails,
        notes: payload.notes,
        statusHistory: [
          {
            status: 'Pending',
            changedAt: new Date().toISOString(),
            changedBy: userId,
          },
        ],
      })

      // 7. Save the order and update product stocks in a transaction
      const session = await OrderModel.startSession()
      session.startTransaction()

      try {
        // Save the order
        await order.save({ session })

        // Update product stocks
        if (productUpdates.length > 0) {
          await ProductModel.bulkWrite(productUpdates, { session })
        }

        await session.commitTransaction()
        session.endSession()
      } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
      }

      // 8. Return the created order
      const createdOrder = await OrderModel.findById(order._id)
        .populate('products.product', 'title')
        .populate('user', 'fullName')

      return ServiceResponse.success(
        'Order created successfully',
        createdOrder,
        StatusCodes.CREATED
      )
    } catch (error) {
      console.error('[createOrder Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUserOrderDetails(orderId: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(orderId)) {
        return ServiceResponse.failure(
          'Invalid order ID!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const order = await OrderModel.findOne({ _id: orderId, user: userId })
        .populate({
          path: 'user',
          select: 'fullName email phone',
        })
        .populate({
          path: 'products.product',
          model: 'Product',
          select: 'title slug thumbnail pricing',
        })
        .populate({
          path: 'statusHistory.changedBy',
          model: 'User',
          select: 'fullName email',
        })

      if (!order) {
        return ServiceResponse.failure(
          'Order not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Order fetched successfully!',
        order,
        StatusCodes.OK
      )
    } catch (error) {
      console.error('[getOrderDetails Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAdminOrderDetails(orderId: string) {
    try {
      if (!Types.ObjectId.isValid(orderId)) {
        return ServiceResponse.failure(
          'Invalid order ID!',
          null,
          StatusCodes.BAD_REQUEST
        )
      }

      const order = await OrderModel.findById(orderId)
        .populate({
          path: 'user',
          select: 'fullName email phone',
        })
        .populate({
          path: 'products.product',
          model: 'Product',
          select: 'title slug thumbnail pricing',
        })
        .populate({
          path: 'statusHistory.changedBy',
          model: 'User',
          select: 'fullName email',
        })

      if (!order) {
        return ServiceResponse.failure(
          'Order not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Order fetched successfully!',
        order,
        StatusCodes.OK
      )
    } catch (error) {
      console.error('[getOrderDetails Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllOrders(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit

      const [orders, totalCount] = await Promise.all([
        OrderModel.find(
          {},
          'orderStatus paymentStatus finalAmount invoiceNumber createdAt'
        )
          .populate({
            path: 'user',
            model: 'User',
            select: 'fullName',
          })
          .populate('products.product', 'title')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        OrderModel.countDocuments(),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }

      return ServiceResponse.success('Order list fetched successfully!', {
        orders,
        pagination,
      })
    } catch (error) {
      console.error('[getAllOrders Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUserOrders(page: number, limit: number, userId: string) {
    try {
      const skip = (page - 1) * limit

      const [orders, totalCount] = await Promise.all([
        OrderModel.find(
          { user: userId },
          'orderStatus paymentStatus finalAmount invoiceNumber createdAt'
        )
          .populate('products.product', 'title')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        OrderModel.countDocuments({ user: userId }),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      const pagination = {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }

      return ServiceResponse.success('Order list fetched successfully!', {
        orders,
        pagination,
      })
    } catch (error) {
      console.error('[getUserOrders Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateOrderStatus(
    order_id: string,
    payload: IOrderStatusPayload,
    userId: string
  ) {
    try {
      const order = await OrderModel.findByIdAndUpdate(
        order_id,
        {
          $set: { orderStatus: payload.orderStatus },
          $push: {
            statusHistory: {
              status: payload.orderStatus,
              changedAt: new Date(),
              changedBy: userId,
            },
          },
        },
        { new: true }
      )

      if (!order) {
        return ServiceResponse.failure(
          'Order not found!',
          null,
          StatusCodes.NOT_FOUND
        )
      }

      return ServiceResponse.success(
        'Order status updated successfully!',
        order
      )
    } catch (error) {
      console.error('[updateOrderStatus Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getOrderStatistics() {
    try {
      const now = new Date()

      // Today's date range
      const todayStart = startOfDay(now)
      const todayEnd = endOfDay(now)

      // Current month date range
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      // Execute all queries in parallel
      const [
        todayOrdersCount,
        todaySales,
        monthOrdersCount,
        monthSales,
        statusCounts,
      ] = await Promise.all([
        // Today's orders count
        OrderModel.countDocuments({
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }),

        // Today's sales
        OrderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: todayStart, $lte: todayEnd },
              paymentStatus: 'Success',
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$finalAmount' },
            },
          },
        ]),

        // This month's orders count
        OrderModel.countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd },
        }),

        // This month's sales
        OrderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: monthStart, $lte: monthEnd },
              paymentStatus: 'Success',
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$finalAmount' },
            },
          },
        ]),

        // Order status counts
        OrderModel.aggregate([
          {
            $group: {
              _id: '$orderStatus',
              count: { $sum: 1 },
            },
          },
        ]),
      ])

      // Convert status counts array to object
      const statusCountsObj = statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count
        return acc
      }, {} as Record<string, number>)

      // Prepare response
      const response = {
        today: {
          orders: todayOrdersCount,
          sales: todaySales[0]?.total || 0,
        },
        thisMonth: {
          orders: monthOrdersCount,
          sales: monthSales[0]?.total || 0,
        },
        statusCounts: {
          pending: statusCountsObj['Pending'] || 0,
          processing: statusCountsObj['Processing'] || 0,
          completed: statusCountsObj['Delivered'] || 0,
          cancelled: statusCountsObj['Cancelled'] || 0,
        },
      }

      return ServiceResponse.success('Order statistics', response)
    } catch (error) {
      console.error('[getOrderStatistics Error]', error)
      return ServiceResponse.failure(
        'Internal server error!',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const orderService = new OrderService()
