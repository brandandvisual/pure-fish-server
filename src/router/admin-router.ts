import { appContentRouter } from '@/api/app-content/app-content-router'
import { catAdminRouter } from '@/api/category/cat.router'
import { couponAdminRouter } from '@/api/coupon/coupon.router'
import { notificationRouter } from '@/api/notifications/notification.router'
import { orderAdminRouter } from '@/api/order/order.router'
import { productAdminRouter } from '@/api/product/product.router'
import { testimonialRouter } from '@/api/testimonial/testimonial.router'
import { userAdminRouter } from '@/api/user/user-router'
import { Router } from 'express'

export const adminRouter = Router()

const routes = [
  {
    path: '/product',
    router: productAdminRouter,
  },
  {
    path: '/category',
    router: catAdminRouter,
  },
  {
    path: '/app-content',
    router: appContentRouter,
  },
  {
    path: '/testimonial',
    router: testimonialRouter,
  },
  {
    path: '/coupon',
    router: couponAdminRouter,
  },
  {
    path: '/order',
    router: orderAdminRouter,
  },
  {
    path: '/user',
    router: userAdminRouter,
  },
  {
    path: '/notification',
    router: notificationRouter,
  },
]

routes.forEach((route) => {
  adminRouter.use(route.path, route.router)
})
