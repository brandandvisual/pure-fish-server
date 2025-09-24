import bcrypt from 'bcryptjs'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { env } from './envConfig'

export function generateOTP(digit: number = 5): string {
  const min = Math.pow(10, digit - 1)
  const max = Math.pow(10, digit) - 1
  return Math.floor(min + Math.random() * (max - min + 1)).toString()
}

export async function convertToHash(str: string) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(str, salt)
  return hash
}

type IJWTPayload = JwtPayload & {
  id: string
  phone: string
  role: 'admin' | 'moderator' | 'user'
  variant: 'accessToken' | 'refreshToken'
}

export function createJWToken({
  payload,
  expiresIn,
}: {
  payload: IJWTPayload
  expiresIn: SignOptions['expiresIn']
}) {
  const token = jwt.sign(payload, env.JWT_SECRET_KEY, { expiresIn })
  return token
}

export function createRandPassword(length: number = 6): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }
  return password
}

export function createUniqueTransaction(userId: string) {
  return `${userId}-${Date.now()}-${createRandPassword(10)}`
}

export function getDiscountPrice(price: number, discount: number) {
  return Math.ceil(price - (price * discount) / 100)
}
