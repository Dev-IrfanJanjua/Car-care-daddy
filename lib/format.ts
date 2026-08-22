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
