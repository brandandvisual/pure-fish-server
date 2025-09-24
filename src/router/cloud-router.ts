import { cloudAdminRouter } from '@/api/cloud/cloudinary.router'
import { Router } from 'express'

export const cloudRouter = Router()

const routes = [
  {
    path: '/admin',
    router: cloudAdminRouter,
  },
]

routes.forEach((route) => {
  cloudRouter.use(route.path, route.router)
})

