import nodemailer from 'nodemailer'
import { google } from 'googleapis'

function createTransport() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const user = process.env.GMAIL_USER

  if (!clientId || !clientSecret || !refreshToken || !user) {
    console.error('[Gmail] Missing credentials:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
    })
    throw new Error('Gmail credentials not configured in .env.local')
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  )

  oAuth2Client.setCredentials({ refresh_token: refreshToken })

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: user,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
    },
  } as nodemailer.TransportOptions)
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const transport = createTransport()
  return transport.sendMail({
    from: `CareerOS <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
