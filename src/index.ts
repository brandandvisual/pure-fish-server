import { env } from '@/common/utils/envConfig'
import { app, logger } from '@/server'
import { dbConnect } from './db/db-connect'

async function startServer() {
  try {
    await dbConnect({ dbName: env.DATABASE_NAME })

    const server = app.listen(env.PORT, () => {
      const { NODE_ENV, HOST, PORT } = env
      logger.info(
        `[+] Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`
      )
    })

    const onCloseSignal = () => {
      logger.info('sigint received, shutting down')
      server.close(() => {
        logger.info('server closed')
        process.exit()
      })
      setTimeout(() => process.exit(1), 10000).unref() // Force shutdown after 10s
    }

    process.on('SIGINT', onCloseSignal)
    process.on('SIGTERM', onCloseSignal)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error) // এটা helpful
    logger.error('[-] Error starting server:', error)
    process.exit(1)
  }
}

startServer()
