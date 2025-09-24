import { env } from '../utils/envConfig'

class SmsManager {
  async sendMessage({ to, message }: { to: string; message: string }) {
    const res = await fetch(
      `https://api.sms.net.bd/sendsms?api_key=${
        env.SMS_NETBD_API_KEY
      }&msg=${encodeURIComponent(message)}&to=${to}`
    )
    if (!res.ok) throw new Error('SMS request failed')
    const json = await res.json()
    return json as {
      error: number
      msg: string
      data: { request_id: number }
    }
  }
}

export const smsManager = new SmsManager()
