import multer, { ErrorCode, memoryStorage, MulterError } from 'multer'

export class MulterCustomError extends MulterError {
  message: string
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode)
    this.message = message
  }
}

class FileMiddleware {
  public singleImageUploader = multer({
    storage: memoryStorage(),
    limits: {
      fileSize: 2 * 1024 * 1024, // max 2 MB
      files: 1, // max file allowed
    },
    fileFilter(req, file, callback) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true)
      } else {
        callback(
          new MulterCustomError(
            'LIMIT_UNEXPECTED_FILE',
            'Invalid file type. Only JPEG, PNG, and WEBP are allowed.'
          )
        )
      }
    },
  }).single('singleImage')
}

export const fileMiddleware = new FileMiddleware()
