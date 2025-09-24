import { convertToHash } from '@/common/utils'
import bcrypt from 'bcryptjs'
import { Document, Schema, model } from 'mongoose'

export type ITType = 'token' | 'otp'

export interface ISingleToken {
  token: string
  expiresAt: Date
}

export interface IToken extends Document {
  user: Schema.Types.ObjectId
  accessToken?: ISingleToken
  refreshToken?: ISingleToken
  oneTimePass?: ISingleToken
  type: ITType
  isUsed: boolean
  createdAt: Date
  updatedAt: Date
  compareOTP: (inputOtp: string) => Promise<boolean>
}

const singleToken = new Schema<ISingleToken>(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
)

const TokenSchema = new Schema<IToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessToken: singleToken,
    refreshToken: singleToken,
    oneTimePass: singleToken,
    type: {
      type: String,
      enum: ['token', 'otp'],
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
)

// Method to verify OTP
TokenSchema.methods.compareOTP = async function (
  this: IToken,
  inputOtp: string
): Promise<boolean> {
  if (!this.oneTimePass) return false
  const isMatched = await bcrypt.compare(inputOtp, this.oneTimePass.token)
  return isMatched
}

// Pre-save hook to hash OTP before saving
TokenSchema.pre<IToken>('save', async function (next) {
  if (this.isModified('oneTimePass') && this.oneTimePass) {
    this.oneTimePass.token = await convertToHash(this.oneTimePass.token)
  }
  next()
})

export const TokenModel = model<IToken>('Token', TokenSchema)
