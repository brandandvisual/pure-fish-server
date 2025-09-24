import nodemailer from 'nodemailer'
import { env } from '../utils/envConfig'
import { IMessagePayload } from '@/api/message/message.zod-schema'

export class Email {
  public async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  }) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.SMTP_ID,
        pass: env.SMTP_SECRET,
      },
    })
    const info = await transporter.sendMail({
      from: `"${env.COMPANY_NAME}" <${env.SMTP_ID}>`,
      to,
      subject,
      html,
    })
    return info
  }

  public OTPVerificationTemplate(otp: string, expiredIn: number) {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Verification Code</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f9fafb;
      color: #333333;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tr>
        <td align="center" style="padding: 20px 0">
          <table
            role="presentation"
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 100%;
            "
          >
            <tr>
              <td
                align="center"
                style="padding: 30px 30px 20px 30px; background-color: #f1f1f1"
              >
                <img
                  class="object-cover"
                  src="${env.COMPANY_LOGO_URL}"
                  alt="${env.COMPANY_NAME}"
                  width="150"
                  style="
                    display: block;
                    border: 0;
                    max-height: 84px;
                    object-fit: contain;
                  "
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 30px 20px 30px">
                <h1
                  style="
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    line-height: 30px;
                    color: #333333;
                    text-align: center;
                  "
                >
                  Verification Code
                </h1>
                <p
                  style="
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    line-height: 24px;
                    color: #555555;
                    text-align: center;
                  "
                >
                  We received a request to verify your account. Please use the
                  verification code below:
                </p>
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin-bottom: 25px"
                >
                  <tr>
                    <td align="center">
                      <div
                        style="
                          background-color: #f5f7fa;
                          border: 1px solid #e5e7eb;
                          border-radius: 6px;
                          padding: 20px;
                          display: inline-block;
                          min-width: 200px;
                        "
                      >
                        <p
                          style="
                            margin: 0 0 5px 0;
                            font-size: 14px;
                            color: #6b7280;
                            text-align: center;
                          "
                        >
                          Your verification code is:
                        </p>
                        <p
                          style="
                            margin: 0;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 5px;
                            color: ${env.COMPANY_PRIMARY_COLOR};
                            text-align: center;
                          "
                        >
                          ${otp}
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                <p
                  style="
                    margin: 0 0 25px 0;
                    font-size: 14px;
                    line-height: 22px;
                    color: #6b7280;
                    text-align: center;
                  "
                >
                  ⏰ This code will expire in <strong>${expiredIn} minutes</strong> from
                  now.
                </p>

                <p
                  style="
                    margin: 0 0 25px 0;
                    font-size: 16px;
                    line-height: 24px;
                    color: #555555;
                    text-align: center;
                  "
                >
                  If you didn't request this code, you can safely ignore this
                  email.
                </p>
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin-bottom: 25px;
                    background-color: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    border-radius: 4px;
                  "
                >
                  <tr>
                    <td style="padding: 15px">
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          line-height: 22px;
                          color: #92400e;
                        "
                      >
                        <strong>Security Tip:</strong> We will never ask you to
                        share this code with anyone. If someone asks for your
                        code, please report it immediately.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 20px 30px;
                  background-color: #f5f7fa;
                  border-top: 1px solid #e5e7eb;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td style="padding: 0 0 10px 0; text-align: center">
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          line-height: 20px;
                          color: #6b7280;
                        "
                      >
                        &copy; ${new Date().getFullYear()} ${env.COMPANY_NAME
      }. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; text-align: center">
                      <p
                        style="
                          margin: 0;
                          font-size: 12px;
                          line-height: 18px;
                          color: #9ca3af;
                        "
                      >
                        This is an automated message, please do not reply to
                        this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }

  public resetPasswordTemplate(href: string, token: string) {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f9fafb;
      color: #333333;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tr>
        <td align="center" style="padding: 20px 0">
          <table
            role="presentation"
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 100%;
            "
          >
            <tr>
              <td
                align="center"
                style="padding: 30px 30px 20px 30px; background-color: #f1f1f1"
              >
                <img
                  src="${env.COMPANY_LOGO_URL}"
                  alt="${env.COMPANY_NAME}"
                  width="150"
                  style="display: block; border: 0"
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 30px 20px 30px">
                <h1
                  style="
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    line-height: 30px;
                    color: #333333;
                    text-align: center;
                  "
                >
                  Reset Your Password
                </h1>
                <p
                  style="
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    line-height: 24px;
                    color: #555555;
                    text-align: center;
                  "
                >
                  We received a request to reset your password. Click the button
                  below to create a new password:
                </p>
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin-bottom: 30px"
                >
                  <tr>
                    <td align="center">
                      <table
                        role="presentation"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                      >
                        <tr>
                          <td
                            align="center"
                            style="border-radius: 6px"
                            bgcolor="#4f46e5"
                          >
                            <a
                              href="${env.CLIENT_URL + href}?token=${token}"
                              target="_blank"
                              style="
                                font-size: 16px;
                                font-family: Arial, sans-serif;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 6px;
                                padding: 12px 25px;
                                border: 1px solid #4f46e5;
                                display: inline-block;
                                font-weight: bold;
                              "
                              >Reset Password</a
                            >
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p
                  style="
                    margin: 0 0 25px 0;
                    font-size: 14px;
                    line-height: 22px;
                    color: #6b7280;
                    text-align: center;
                  "
                >
                  ⏰ This link will expire in <strong>15 minutes</strong> from now.
                </p>

                <p
                  style="
                    margin: 0 0 25px 0;
                    font-size: 16px;
                    line-height: 24px;
                    color: #555555;
                    text-align: center;
                  "
                >
                  If you didn't request a password reset, you can safely ignore
                  this email.
                </p>
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin-bottom: 25px;
                    background-color: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    border-radius: 4px;
                  "
                >
                  <tr>
                    <td style="padding: 15px">
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          line-height: 22px;
                          color: #92400e;
                        "
                      >
                        <strong>Security Tip:</strong> After resetting your
                        password, make sure to use a strong, unique password
                        that you don't use for other websites.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 20px 30px;
                  background-color: #f5f7fa;
                  border-top: 1px solid #e5e7eb;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td style="padding: 0 0 10px 0; text-align: center">
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          line-height: 20px;
                          color: #6b7280;
                        "
                      >
                        &copy; ${new Date().getFullYear()} ${env.COMPANY_NAME
      }. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; text-align: center">
                      <p
                        style="
                          margin: 0;
                          font-size: 12px;
                          line-height: 18px;
                          color: #9ca3af;
                        "
                      >
                        This is an automated message, please do not reply to
                        this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
  }

  public publicMessageTemplate(payload: IMessagePayload) {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us Form Submission</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: #ED1B24;
        color: #ffffff;
        padding: 10px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        border-radius: 10px 10px 0 0;
      }
      .content {
        padding: 20px;
      }
      .info {
        margin-bottom: 10px;
      }
      .info strong {
        color: #333;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #666;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        New Contact Form Submission
      </div>
      <div class="content">
        <p><strong>You have received a new message from the Contact Us form.</strong></p>
        <div class="info"><strong>Full Name:</strong> ${payload.firstName} ${payload.lastName}</div>
        <div class="info"><strong>Email:</strong> ${payload.email}</div>
        <div class="info"><strong>Phone:</strong> ${payload.phone}</div>
        <div class="info"><strong>Message:</strong></div>
        <p style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ED1B24;">${payload.message}</p>
      </div>
      <div class="footer">
        <p>This is a public message. Please be careful when dealing with users.</p>
      </div>
    </div>
  </body>
  </html>
  `
  }

  public messageConfirmationTemplate(payload: IMessagePayload) {
    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Contact Us - Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #ED1B24;
          color: #ffffff;
          padding: 10px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 20px;
        }
        .info {
          margin-bottom: 10px;
        }
        .info strong {
          color: #333;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Thank You for Contacting Us</div>
        <div class="content">
          <p>Dear ${payload.firstName} ${payload.lastName},</p>
          <p>
            We have received your message and our support team will get back to
            you as soon as possible.
          </p>
          <p>Here is a summary of your submission:</p>
          <div class="info"><strong>Email:</strong> ${payload.email}</div>
          <div class="info"><strong>Phone:</strong> ${payload.phone}</div>
          <div class="info"><strong>Message:</strong></div>
          <p
            style="
              background: #f9f9f9;
              padding: 10px;
              border-left: 4px solid #ED1B24;
            "
          >
            ${payload.message}
          </p>
          <p>Thank you for reaching out to us. We appreciate your patience.</p>
        </div>
        <div class="footer">
          <p><strong>Customer Support Team, <span style="color: #ED1B24">Corporate Ask</span></strong></p>
        </div>
      </div>
    </body>
  </html>
  `
  }
}

export const email = new Email()
