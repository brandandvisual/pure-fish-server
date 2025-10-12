import { authRouter, userRouter } from '@/api/user/user-router'
import { Request, Response, Router } from 'express'
import { adminRouter } from './admin-router'
import { cloudRouter } from './cloud-router'
import { publicRouter } from './public-router'
import { guestRouter } from '@/api/guest/guest-router'
import { messageRouter } from './message-router'

export const router = Router()

router.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'Welcome To Rutt Wear And Pure Fish API' })
})

const routes = [
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/user',
    router: userRouter,
  },
  {
    path: '/guest',
    router: guestRouter,
  },
  {
    path: '/admin',
    router: adminRouter,
  },
  {
    path: '/cloud',
    router: cloudRouter,
  },
  {
    path: '/public',
    router: publicRouter,
  },
  {
    path: '/message',
    router: messageRouter,
  }

]

routes.forEach((route) => {
  router.use(route.path, route.router)
})
