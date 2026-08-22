import { getResendClient } from './resend'
import { bookingSuccessUrl, escapeHtml } from './booking-links'
import type { BookingEmailInfo } from './send-booking-confirmation'

const FROM_ADDRESS = 'Car Care <onboarding@resend.dev>'

export async function sendBookingReminderEmail(booking: BookingEmailInfo) {
  const resend = getResendClient()
  if (!resend) return

  const firstName = escapeHtml(booking.customerName.split(' ')[0])
  const where = escapeHtml(`${booking.serviceAddress}, ${booking.serviceCity}`)
  const when = new Date(booking.scheduledAt).toLocaleString()
  const detailsUrl = bookingSuccessUrl(booking.bookingId, booking.accessToken)

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: booking.customerEmail,
      subject: 'Reminder: your Car Care appointment is tomorrow',
      html: `
        <p>Hi ${firstName},</p>
        <p>Just a reminder that we'll see you <strong>tomorrow, ${when}</strong> at ${where}.</p>
        <p>Total: $${booking.totalAmount.toFixed(2)}</p>
        <p><a href="${detailsUrl}">View your booking</a></p>
      `,
    })
  } catch {
    // Email delivery is best-effort; a failed send should never break the reminder job.
  }
}
