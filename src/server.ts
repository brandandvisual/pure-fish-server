import { openAPIRouter } from '@/api-docs/openAPIRouter'
import requestLogger from '@/common/middleware/requestLogger'
import { env } from '@/common/utils/envConfig'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import { pino } from 'pino'
import { errorMiddleware } from './common/middleware/error.middleware'
import { router } from './router'

const logger = pino({ name: 'server start' })
const app: Express = express()

// Set the application to trust the reverse proxy
app.set('trust proxy', true)

const allowedOrigins = env.CORS_ORIGIN

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('public'))
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}));
app.use(helmet())
// app.use(rateLimiter)

// Request logging
app.use(requestLogger)

// Routes
app.use('/api/v1', router)

// Swagger UI
app.use(openAPIRouter)

// Error handlers
app.use([errorMiddleware.notFound, errorMiddleware.globalError])

export { app, logger }
