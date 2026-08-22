import { getResendClient } from './resend'
import { bookingSuccessUrl, escapeHtml } from './booking-links'

// Uses Resend's shared sandbox sender so this works with just an API key --
// swap for a verified domain address before going to production.
const FROM_ADDRESS = 'Car Care <onboarding@resend.dev>'

export type BookingEmailInfo = {
  bookingId: string
  accessToken: string
  customerEmail: string
  customerName: string
  scheduledAt: string
  serviceAddress: string
  serviceCity: string
  totalAmount: number
}

export async function sendBookingConfirmationEmail(booking: BookingEmailInfo) {
  const resend = getResendClient()
  if (!resend) return // RESEND_API_KEY not set yet -- best-effort, never blocks the booking

  const firstName = escapeHtml(booking.customerName.split(' ')[0])
  const where = escapeHtml(`${booking.serviceAddress}, ${booking.serviceCity}`)
  const when = new Date(booking.scheduledAt).toLocaleString()
  const detailsUrl = bookingSuccessUrl(booking.bookingId, booking.accessToken)

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: booking.customerEmail,
      subject: 'Your Car Care appointment is confirmed',
      html: `
        <p>Hi ${firstName},</p>
        <p>Your appointment is confirmed for <strong>${when}</strong> at ${where}.</p>
        <p>Total: $${booking.totalAmount.toFixed(2)}</p>
        <p><a href="${detailsUrl}">View your booking</a></p>
        <p>See you then!</p>
      `,
    })
  } catch {
    // Email delivery is best-effort; a failed send should never break the booking flow.
  }
}
