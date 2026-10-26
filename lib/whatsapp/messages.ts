// Pre-filled WhatsApp messages for every "chat with us" link on the site.
//
// A click-to-chat link opens the customer's own WhatsApp with this text already
// typed, so the shop receives context ("I'm on the services page and need help
// choosing") instead of a blank "Hi". Each place a link appears picks the
// message that matches what the visitor was doing:
//
//   help          -> asking for help, worded for the page they are on
//   priceRequest  -> a price for one service
//   contactForm   -> follow-up to a message sent through the contact form
//   bookingHelp   -> stuck part-way through booking (the "abandoned checkout" case)
//   bookingFollow -> a question or change to a booking already placed
//   order         -> confirming a booking just placed (lib/whatsapp/order-message.ts)
//
// Free of server-only imports so client components can build links too.

export function waLink(base: string, text: string) {
  return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`
}

const GREETING = 'Hi Car Aurum! 👋'

/** Help message worded for the page the visitor is on. */
export function helpMessageForPath(pathname: string | null | undefined): string {
  const path = pathname ?? '/'
  if (path.startsWith('/book/success')) {
    return `${GREETING} I've just placed a booking on your website and have a question about it.`
  }
  if (path.startsWith('/book')) {
    return `${GREETING} I'm booking a service on your website and need a hand finishing my booking.`
  }
  if (path.startsWith('/quote')) {
    return `${GREETING} I'm getting a price on your website and need help choosing my car type or service.`
  }
  if (path.startsWith('/services')) {
    return `${GREETING} I'm looking at your services and need help choosing the right one for my car.`
  }
  if (path.startsWith('/gallery')) {
    return `${GREETING} I saw your before & after work on the website and would like to know what you could do on my car.`
  }
  if (path.startsWith('/about')) {
    return `${GREETING} I read about Car Aurum on your website and have a question before I book.`
  }
  if (path.startsWith('/contact')) {
    return `${GREETING} I have a question about your service: `
  }
  return `${GREETING} I found you on your website and need help choosing the right glass or headlight service for my car.`
}

export const SITE_MESSAGES = {
  hero: `${GREETING} I'd like to restore my car's glass or headlights. Can you advise me on the best option and the price?`,
  bookNow: `${GREETING} I'd like to book a doorstep service in Lahore. Which days and times do you have free this week?`,
  contactCard: `${GREETING} I have a question about your service: `,
  about: `${GREETING} I read about Car Aurum and have a question before I book.`,
  gallery: `${GREETING} I saw your before & after work and would like the same result on my car. Can you tell me what's possible and the price?`,
  footer: `${GREETING} I have a question about Car Aurum.`,
} as const

export const GREETING_PHOTO = `${GREETING} I'm not sure which service my car needs. I'll send you a photo of the problem — can you recommend the right fix and a price?`

export function priceRequestMessage(serviceName: string) {
  return [
    `${GREETING} I'd like a price for *${serviceName}*.`,
    '',
    'My car (make, model, year): ',
  ].join('\n')
}

export function comingSoonMessage(serviceName: string) {
  return `${GREETING} I'm interested in *${serviceName}*. Please let me know when it's available and what it will cost.`
}

export function contactFormMessage(d: { name: string; service?: string; message: string }) {
  const first = d.name.trim().split(' ')[0] || d.name
  return [
    `${GREETING} It's ${first} — I just sent you a message through your website${d.service ? ` about ${d.service}` : ''}:`,
    '',
    `"${d.message.trim().slice(0, 400)}"`,
    '',
    'Looking forward to hearing from you.',
  ].join('\n')
}

/**
 * Someone stuck part-way through the booking flow. Carries whatever they had
 * chosen so far, so the shop can finish the booking for them in the chat.
 */
export type BookingProgress = {
  car?: string
  year?: string
  carType?: string
  services?: string[]
  total?: number
  when?: string
  name?: string
}

export function bookingHelpMessage(p: BookingProgress, formatPrice: (n: number) => string) {
  const lines = [`${GREETING} I started a booking on your website and need a hand finishing it.`, '']
  if (p.name) lines.push(`Name: ${p.name}`)
  const car = [p.year, p.car].filter(Boolean).join(' ')
  if (car || p.carType) lines.push(`Car: ${[car, p.carType && `(${p.carType})`].filter(Boolean).join(' ')}`)
  if (p.services?.length) lines.push(`Services: ${p.services.join(', ')}`)
  if (p.total) lines.push(`Total shown: ${formatPrice(p.total)}`)
  if (p.when) lines.push(`Preferred time: ${p.when}`)
  if (lines.length === 2) lines.push('I have a question before I continue.')
  else {
    lines.push('', 'Can you help me complete it?')
  }
  return lines.join('\n')
}

/** A question or change request about a booking that is already placed. */
export function bookingFollowUpMessage(d: { name: string; ref: string; vehicle: string; when: string }) {
  const first = d.name.trim().split(' ')[0] || d.name
  return [
    `${GREETING} It's ${first}. I have a question about my booking.`,
    '',
    `Ref: ${d.ref}`,
    `Car: ${d.vehicle}`,
    `Appointment: ${d.when}`,
    '',
    'I would like to: ',
  ].join('\n')
}
