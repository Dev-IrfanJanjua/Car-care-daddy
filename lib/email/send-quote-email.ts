import { getResendClient } from './resend'
import { escapeHtml } from './booking-links'

const FROM_ADDRESS = 'Car Care <onboarding@resend.dev>'

export type QuoteEmailInfo = {
  to: string
  customerName: string
  vehicle: string
  lineItems: { name: string; price: number }[]
  total: number
  quoteUrl: string
}

export async function sendQuoteEmail(quote: QuoteEmailInfo) {
  const resend = getResendClient()
  if (!resend) return // RESEND_API_KEY not set -- best-effort, same as the booking emails

  const greeting = quote.customerName
    ? `Hi ${escapeHtml(quote.customerName.split(' ')[0])},`
    : 'Hi,'
  const rows = quote.lineItems
    .map(
      (item) =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(
          item.name
        )}</td><td align="right">$${item.price.toFixed(2)}</td></tr>`
    )
    .join('')

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: quote.to,
      subject: 'Your Car Care quote',
      html: `
        <p>${greeting}</p>
        <p>Here's your quote for the ${escapeHtml(quote.vehicle)}:</p>
        <table>${rows}</table>
        <p><strong>Total: $${quote.total.toFixed(2)}</strong></p>
        <p><a href="${quote.quoteUrl}">Book this quote</a></p>
        <p>Prices hold for 7 days.</p>
      `,
    })
  } catch {
    // Best-effort: a failed send must not lose the captured lead.
  }
}
