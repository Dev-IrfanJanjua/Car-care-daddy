// Brevo transactional email transport.
//
// Brevo over Resend because its free tier (300/day) authenticates a single
// sender address rather than a whole domain, so customer mail works without
// owning one. Plain fetch rather than the SDK -- one POST does not justify a
// dependency, and this keeps the serverless bundle small.
//
// Returns a boolean rather than throwing: every caller is a best-effort
// notification that must never break a booking. Failures are logged so they
// show up in the Vercel runtime logs instead of vanishing -- the previous
// implementation swallowed them into an empty catch, which is why unsent mail
// was invisible.

const ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

export type EmailPayload = {
  to: string
  toName?: string
  subject: string
  html: string
}

export async function sendEmail({ to, toName, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL

  // Unconfigured is a no-op, not an error: local dev and preview deploys run
  // without mail credentials and must still be able to complete a booking.
  if (!apiKey || !senderEmail) return false

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'Car Care' },
        to: [toName ? { email: to, name: toName } : { email: to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      // Body carries Brevo's reason (unverified sender, quota, bad key).
      console.error(`[brevo] send failed ${res.status}: ${await res.text()}`)
      return false
    }

    return true
  } catch (error) {
    console.error('[brevo] request threw', error)
    return false
  }
}
