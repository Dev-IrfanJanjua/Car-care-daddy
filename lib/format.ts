const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const compactCurrency = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

// Prices are whole rupees -- no service is priced in paisa, so trailing ".00"
// on every figure is just noise. Rendered as "Rs 4,500".
const pkr = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
})

export function formatCompactNumber(value: number) {
  return compactNumber.format(value)
}

export function formatCompactCurrency(value: number) {
  return compactCurrency.format(value)
}

/** The single place prices become text. Use everywhere a customer sees money. */
export function formatPrice(value: number) {
  return pkr.format(value)
}

// Appointment times are stored as UTC instants but every customer and
// technician is in Lahore, so pin the zone rather than letting it resolve to
// wherever the code happens to run. A bare toLocaleString() in a server
// component renders in the server's zone (UTC on Vercel), which showed people
// the wrong appointment time; pinning it also keeps server and client output
// identical, so there is nothing for hydration to mismatch on.
const pktDateTime = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** The single place appointment instants become text, always in Lahore time. */
export function formatAppointment(iso: string) {
  return pktDateTime.format(new Date(iso))
}
