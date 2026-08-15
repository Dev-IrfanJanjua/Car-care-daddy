const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCompactNumber(value: number) {
  return compactNumber.format(value)
}

export function formatCompactCurrency(value: number) {
  return compactCurrency.format(value)
}
