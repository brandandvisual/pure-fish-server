import { convertToHash } from '@/common/utils'
import bcrypt from 'bcryptjs'
import { Document, model, Schema } from 'mongoose'
import { IAddressPayload } from './user.zod-schema'

export interface IBanInfo {
  reason: string
  bannedAt: Date
}

export interface IUser extends Document {
  fullName: string
  email?: string
  password?: string
  phone: string
  role: 'admin' | 'moderator' | 'user'
  image?: string | null
  emailVerified: boolean
  phoneVerified: boolean
  address: IAddressPayload | null
  lastSignedInAt: string | null
  lastUsedAt: string | null
  isBanned: boolean
  banInfo: IBanInfo | null
  updateLastSignedIn: () => Promise<void>
  updateLastUsedIn: () => Promise<void>
  matchPassword: (inputPass: string) => Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddressPayload>(
  {
    houseNo: {
      type: String,
      required: true,
      trim: true,
    },
    roadNo: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
)

const BanSchema = new Schema<IBanInfo>(
  {
    reason: {
      type: String,
      required: true,
    },
    bannedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
)

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'user'],
      default: 'user',
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    image: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    address: { type: AddressSchema, default: null },
    lastSignedInAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
    banInfo: { type: BanSchema, default: null },
  },
  { timestamps: true, versionKey: false }
)

UserSchema.methods.updateLastSignedIn = async function (this: IUser) {
  this.lastSignedInAt = new Date().toISOString()
  await this.save()
}

UserSchema.methods.updateLastUsedIn = async function (this: IUser) {
  this.lastUsedAt = new Date().toISOString()
  await this.save()
}

UserSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await convertToHash(this.password)
  }
  next()
})

UserSchema.methods.matchPassword = async function (inputPass: string) {
  const isMatched = await bcrypt.compare(inputPass, this.password)
  return isMatched
}

export const UserModel = model<IUser>('User', UserSchema)
