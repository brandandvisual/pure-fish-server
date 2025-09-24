import { sendServiceResponse } from '@/common/utils/httpHandlers'
import { Request, Response } from 'express'
import { userService } from './user.service'
import { IRequest } from '@/common/middleware/auth.middleware'

class UserController {
  public async signup(req: Request, res: Response) {
    const serviceRes = await userService.createUser(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async verifyEmail(req: Request, res: Response) {
    const serviceRes = await userService.verifyEmail(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async verifyPhone(req: Request, res: Response) {
    const serviceRes = await userService.verifyPhone(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async requestOTP(req: Request, res: Response) {
    const serviceRes = await userService.requestOTP(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async signinByCredential(req: Request, res: Response) {
    const serviceRes = await userService.signinByCredential(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async getSession(req: Request, res: Response) {
    const { userId } = req as IRequest
    const serviceRes = await userService.getSession(userId)
    return sendServiceResponse(serviceRes, res)
  }

  public async forgotPassword(req: Request, res: Response) {
    const serviceRes = await userService.forgotPassword(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  // reset password method
  public async resetPassword(req: Request, res: Response) {
    const userId = (req as IRequest).userId
    const payload = req.body
    const serviceRes = await userService.resetPassword(userId, payload)
    return sendServiceResponse(serviceRes, res)
  }

  // public async checkVerifiedUser(req: Request, res: Response) {
  //   const serviceRes = await userService.checkVerifiedUser(req.body)
  //   return sendServiceResponse(serviceRes, res)
  // }

  public async isPhoneVerified(req: Request, res: Response) {
    const serviceRes = await userService.isPhoneVerified(req.body)
    return sendServiceResponse(serviceRes, res)
  }

  public async updatePassword(req: Request, res: Response) {
    const payload = req.body
    const serviceResponse = await userService.updatePassword(req, payload)
    return sendServiceResponse(serviceResponse, res)
  }

  public async updateProfile(req: Request, res: Response) {
    const payload = req.body
    const serviceResponse = await userService.updateProfile(req, payload)
    return sendServiceResponse(serviceResponse, res)
  }

  public async updateAddress(req: Request, res: Response) {
    const payload = req.body
    const userId = (req as IRequest).userId
    const serviceRes = await userService.updateAddress(userId, payload)
    return sendServiceResponse(serviceRes, res)
  }

  public async createNewTokens(req: Request, res: Response) {
    const payload = req.body
    const serviceRes = await userService.createNewTokens(payload)
    return sendServiceResponse(serviceRes, res)
  }

  public async getUsers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20
    const serviceRes = await userService.getUsers(page, limit)
    return sendServiceResponse(serviceRes, res)
  }
}

export const userController = new UserController()
