// Messages the SHOP sends to a customer from the admin panel -- the mirror image
// of lib/whatsapp/messages.ts. Each one opens WhatsApp with the text typed and
// the customer's number filled in, ready to send. Nothing is sent automatically.

import { formatAppointment, formatPrice } from '@/lib/format'
import { waLink } from './messages'
import { bookingReviewUrl } from '@/lib/email/booking-links'

export type BookingForMessage = {
  id: string
  accessToken: string
  customerName: string
  vehicle: string
  scheduledAt: string
  address: string
  services: string[]
  total: number
}

export type LeadForMessage = {
  name: string | null
  vehicle: string
  services: string[]
  total: number | null
  message: string | null
}

const first = (name: string | null) => (name ?? '').trim().split(' ')[0] || 'there'
const SIGN = '— Car Aurum'

export type CustomerTemplate = { key: string; label: string; hint: string; text: string }

export function bookingTemplates(b: BookingForMessage): CustomerTemplate[] {
  const when = formatAppointment(b.scheduledAt)
  const list = b.services.map((s) => `• ${s}`).join('\n')
  return [
    {
      key: 'confirm',
      label: 'Confirm booking',
      hint: 'Right after they book',
      text: [
        `Hi ${first(b.customerName)}, thank you for booking with Car Aurum! ✅`,
        '',
        `Car: ${b.vehicle}`,
        `When: ${when}`,
        `Where: ${b.address}`,
        '',
        list,
        `Total: ${formatPrice(b.total)} (payable after the work)`,
        '',
        "We'll message you before we set off. Reply here if anything changes.",
        SIGN,
      ].join('\n'),
    },
    {
      key: 'reminder',
      label: 'Reminder',
      hint: 'Day before / on the way',
      text: [
        `Hi ${first(b.customerName)}, a quick reminder that we're coming to you for your ${b.vehicle} — ${when}.`,
        '',
        `Address: ${b.address}`,
        'Please keep the car where we can reach it, with access to the glass. Reply here if you need to change the time.',
        SIGN,
      ].join('\n'),
    },
    {
      key: 'completed',
      label: 'Work completed',
      hint: 'After the job, with review link',
      text: [
        `Hi ${first(b.customerName)}, your ${b.vehicle} is done ✨ Thank you for choosing Car Aurum.`,
        '',
        'Your results are covered by our 3-year warranty — message us here if you ever notice anything.',
        '',
        `If you're happy, a quick review means a lot to us: ${bookingReviewUrl(b.id, b.accessToken)}`,
        SIGN,
      ].join('\n'),
    },
    {
      key: 'followup',
      label: 'Follow-up',
      hint: 'A few days after the job',
      text: [
        `Hi ${first(b.customerName)}, it's Car Aurum. Just checking in — how is your ${b.vehicle} looking after the service?`,
        '',
        'If anything is not perfect, tell us and we will put it right. And if a friend or family member needs their glass or headlights restored, we would love to look after them too.',
        SIGN,
      ].join('\n'),
    },
  ]
}

export function leadTemplates(l: LeadForMessage): CustomerTemplate[] {
  const name = first(l.name)
  const quoted = l.services.length > 0
  return [
    ...(quoted
      ? [
          {
            key: 'abandoned',
            label: 'Unfinished booking',
            hint: 'They got a price but did not book',
            text: [
              `Hi ${name}, it's Car Aurum. You were looking at a price for your ${l.vehicle || 'car'} on our website:`,
              '',
              ...l.services.map((s) => `• ${s}`),
              ...(l.total ? ['', `Total: ${formatPrice(l.total)}`] : []),
              '',
              'Would you like us to reserve a time that suits you? We come to your home or office, and the work takes about an hour.',
              SIGN,
            ].join('\n'),
          },
        ]
      : []),
    {
      key: 'reply',
      label: 'Reply to their message',
      hint: 'Contact-form enquiry',
      text: [
        `Hi ${name}, thanks for contacting Car Aurum${l.message ? ` — about: "${l.message.replace(/^\[[^\]]*\]\s*/, '').slice(0, 160)}"` : ''}.`,
        '',
        'Could you tell me your car (make, model, year) and which glass or headlight problem you want fixed? I will send you an exact price and the earliest time we can come.',
        SIGN,
      ].join('\n'),
    },
    {
      key: 'followup',
      label: 'Follow up',
      hint: 'No reply yet',
      text: [
        `Hi ${name}, it's Car Aurum following up on your enquiry. Do you still need help with your ${l.vehicle || 'car'}? We have slots open this week and can come to you.`,
        SIGN,
      ].join('\n'),
    },
  ]
}

/** wa.me link to a customer's own number (Pakistani local format in, digits out). */
export function customerWaUrl(digits: string, text: string) {
  return waLink(`https://wa.me/${digits}`, text)
}
