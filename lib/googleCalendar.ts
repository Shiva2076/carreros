import { google } from 'googleapis'

function getCalendar(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('[Google Calendar] Missing credentials:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    })
    throw new Error('Google Calendar credentials not configured')
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oAuth2Client.setCredentials({ refresh_token: refreshToken })
  return google.calendar({ version: 'v3', auth: oAuth2Client })
}

export async function createInterviewEvent({
  refreshToken,
  summary,
  description,
  startDateTime,
  endDateTime,
}: {
  refreshToken: string
  summary: string
  description: string
  startDateTime: string
  endDateTime: string
}) {
  const calendar = getCalendar(refreshToken)
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone: 'Asia/Kolkata' },
      end: { dateTime: endDateTime, timeZone: 'Asia/Kolkata' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  })
  return res.data
}
