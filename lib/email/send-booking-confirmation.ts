import { getResendClient } from './resend'

// Uses Resend's shared sandbox sender so this works with just an API key --
// swap for a verified domain address before going to production.
const FROM_ADDRESS = 'Car Care <onboarding@resend.dev>'

export type BookingEmailInfo = {
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

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: booking.customerEmail,
      subject: 'Your Car Care appointment is confirmed',
      html: `
        <p>Hi ${booking.customerName.split(' ')[0]},</p>
        <p>Your appointment is confirmed for <strong>${new Date(
          booking.scheduledAt
        ).toLocaleString()}</strong> at ${booking.serviceAddress}, ${booking.serviceCity}.</p>
        <p>Total: $${booking.totalAmount.toFixed(2)}</p>
        <p>See you then!</p>
      `,
    })
  } catch {
    // Email delivery is best-effort; a failed send should never break the booking flow.
  }
}
