import { getResendClient } from './resend'
import type { BookingEmailInfo } from './send-booking-confirmation'

const FROM_ADDRESS = 'Car Care <onboarding@resend.dev>'

export async function sendBookingReminderEmail(booking: BookingEmailInfo) {
  const resend = getResendClient()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: booking.customerEmail,
      subject: 'Reminder: your Car Care appointment is tomorrow',
      html: `
        <p>Hi ${booking.customerName.split(' ')[0]},</p>
        <p>Just a reminder that we'll see you <strong>tomorrow, ${new Date(
          booking.scheduledAt
        ).toLocaleString()}</strong> at ${booking.serviceAddress}, ${booking.serviceCity}.</p>
        <p>Total: $${booking.totalAmount.toFixed(2)}</p>
      `,
    })
  } catch {
    // Email delivery is best-effort; a failed send should never break the reminder job.
  }
}
