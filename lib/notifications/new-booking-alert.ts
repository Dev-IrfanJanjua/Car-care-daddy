// Notifies the shop when a booking comes in. Before this existed the only way
// to learn about a new booking was to open /admin/bookings and look.
//
// Both channels are built from one payload so the service list can't drift
// between the email and the WhatsApp message.

import { sendEmail } from '@/lib/email/brevo'
import { sendAdminWhatsApp } from '@/lib/whatsapp/callmebot'
import { escapeHtml, siteUrl } from '@/lib/email/booking-links'
import { formatPrice, formatAppointment } from '@/lib/format'

export type NewBookingAlert = {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicle: string
  scheduledAt: string
  serviceAddress: string
  serviceCity: string
  lineItems: { name: string; price: number }[]
  totalAmount: number
}

function adminUrl(bookingId: string) {
  return `${siteUrl()}/admin/bookings/${bookingId}`
}

function buildWhatsApp(b: NewBookingAlert) {
  const services = b.lineItems
    .map((item) => `• ${item.name} — ${formatPrice(item.price)}`)
    .join('\n')

  return [
    '🚗 *New booking*',
    '',
    `*${b.customerName}*`,
    b.customerPhone,
    b.vehicle,
    '',
    `📅 ${formatAppointment(b.scheduledAt)}`,
    `📍 ${b.serviceAddress}, ${b.serviceCity}`,
    '',
    '*Services*',
    services,
    '',
    `*Total: ${formatPrice(b.totalAmount)}*`,
    '',
    adminUrl(b.bookingId),
  ].join('\n')
}

function buildEmail(b: NewBookingAlert) {
  // Customer-supplied values land in HTML, so every one of them is escaped.
  const rows = b.lineItems
    .map(
      (item) =>
        `<tr><td style="padding:4px 16px 4px 0">${escapeHtml(
          item.name
        )}</td><td align="right">${formatPrice(item.price)}</td></tr>`
    )
    .join('')

  return `
    <h2>New booking</h2>
    <p>
      <strong>${escapeHtml(b.customerName)}</strong><br/>
      ${escapeHtml(b.customerPhone)}<br/>
      ${escapeHtml(b.customerEmail)}
    </p>
    <p>
      <strong>Vehicle:</strong> ${escapeHtml(b.vehicle)}<br/>
      <strong>When:</strong> ${formatAppointment(b.scheduledAt)}<br/>
      <strong>Where:</strong> ${escapeHtml(`${b.serviceAddress}, ${b.serviceCity}`)}
    </p>
    <h3>Services</h3>
    <table>${rows}</table>
    <p><strong>Total: ${formatPrice(b.totalAmount)}</strong></p>
    <p><a href="${adminUrl(b.bookingId)}">Open in admin</a></p>
  `
}

/**
 * Fans out to email + WhatsApp. Never throws and never blocks the booking:
 * both channels are independent, so a WhatsApp outage still lets the email
 * through and vice versa.
 */
export async function notifyAdminOfNewBooking(booking: NewBookingAlert) {
  const adminEmail = process.env.ADMIN_EMAIL

  await Promise.allSettled([
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: `New booking — ${booking.customerName}, ${formatAppointment(
            booking.scheduledAt
          )}`,
          html: buildEmail(booking),
        })
      : Promise.resolve(false),
    sendAdminWhatsApp(buildWhatsApp(booking)),
  ])
}
