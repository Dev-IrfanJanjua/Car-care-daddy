// Builds the customer -> shop WhatsApp handoff for a placed order.
//
// This is a click-to-chat deep link, not an API send: it costs nothing, needs
// no Meta Business account, and works with the shop's normal WhatsApp. The
// trade-off is that it only reaches the shop if the customer actually taps
// send, which is why lib/notifications/new-booking-alert.ts still fires the
// moment the row is written.
//
// Deliberately free of server-only imports so the success screen can build the
// link in the browser.

import { formatPrice, formatAppointment } from '@/lib/format'

export type OrderDetails = {
  bookingId: string
  customerName: string
  vehicle: string
  scheduledAt: string
  serviceAddress: string
  serviceCity: string
  lineItems: { name: string; price: number }[]
  totalAmount: number
}

export function buildOrderMessage(order: OrderDetails) {
  const services = order.lineItems
    .map((item) => `• ${item.name} — ${formatPrice(item.price)}`)
    .join('\n')

  return [
    "Hi! I'd like to confirm my Car Care booking.",
    '',
    `Name: ${order.customerName}`,
    `Vehicle: ${order.vehicle}`,
    `When: ${formatAppointment(order.scheduledAt)}`,
    `Where: ${order.serviceAddress}, ${order.serviceCity}`,
    '',
    'Services:',
    services,
    '',
    `Total: ${formatPrice(order.totalAmount)}`,
    // Short ref so the shop can match the chat to a row in /admin/bookings
    // without the customer pasting a full UUID.
    `Ref: ${order.bookingId.slice(0, 8)}`,
  ].join('\n')
}

/**
 * `whatsappNumber` is passed in rather than imported so the destination can
 * come from /admin/settings. This runs in the browser, where the settings row
 * is not reachable -- the page that renders the success card looks it up and
 * hands it down.
 */
export function orderWhatsAppUrl(order: OrderDetails, whatsappNumber: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(order))}`
}
