import { catPublicRouter } from '@/api/category/cat.router'
import { couponPublicRouter } from '@/api/coupon/coupon.router'
import { orderUserRouter } from '@/api/order/order.router'
import { productPublicRouter } from '@/api/product/product.router'
import { Router } from 'express'

export const publicRouter = Router()

const routes = [
  {
    path: '/category',
    router: catPublicRouter,
  },
  {
    path: '/product',
    router: productPublicRouter,
  },
  {
    path: '/order',
    router: orderUserRouter,
  },
  {
    path: '/coupon',
    router: couponPublicRouter,
  },
]

routes.forEach((route) => {
  publicRouter.use(route.path, route.router)
})
