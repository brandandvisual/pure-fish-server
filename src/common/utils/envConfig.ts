import dotenv from 'dotenv'
import { cleanEnv, host, num, port, str, testOnly, bool } from 'envalid'

dotenv.config()

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  CLIENT_URL: str(),
  SERVER_URL: str(),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  DATABASE_NAME: str({ devDefault: testOnly('corporate-ask') }),
  MONGO_URI: str({ devDefault: testOnly('mongodb://localhost:27017') }),
  SMTP_ID: str(),
  SMTP_SECRET: str(),
  SUPPORT_EMAIL: str(),
  JWT_SECRET_KEY: str(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
  SSL_STORE_ID: str(),
  SSL_STORE_SECRET_KEY: str(),
  SSL_IS_LIVE: bool(),
  ADMIN_EMAIL: str(),
  COMPANY_NAME: str(),
  COMPANY_LOGO_URL: str(),
  COMPANY_PRIMARY_COLOR: str(),
  SMS_NETBD_API_KEY: str(),
})
