// Pakistani mobile numbers, normalised to the local 11-digit form: 03001234567.
//
// Shared by the booking form and the server action deliberately -- when the two
// disagreed, pasting "+92 300 1234567" was truncated to 11 digits by the input
// and then accepted by the server as 92300123456, storing a number that could
// never be dialled.

/** Digits only, with a +92/92 country code folded back to the leading 0. */
export function normalizePhone(raw: string) {
  let digits = String(raw ?? '').replace(/\D/g, '')

  if (digits.startsWith('92')) {
    // +92 300 1234567 / 92 300 1234567 -> 0300 1234567
    digits = `0${digits.slice(2)}`
  } else if (digits.length === 10 && !digits.startsWith('0')) {
    // 3001234567, as typed when the leading zero is assumed
    digits = `0${digits}`
  }

  return digits.slice(0, 11)
}

/** Exactly 11 digits starting with 0 -- every Pakistani mobile. */
export function isValidPhone(value: string) {
  return /^0\d{10}$/.test(value)
}

/**
 * The form wa.me needs: full international digits, no '+', no spaces, no
 * domestic leading zero. 0328 7203630 -> 923287203630.
 *
 * Deliberately tolerant, because this reads a free-text field an admin typed
 * into /admin/settings -- "+92 328 7203630", "0328-7203630" and "03287203630"
 * all have to land on the same link. Returns '' when there is nothing usable,
 * so callers can fall back rather than build a broken wa.me URL.
 */
export function toWhatsAppDigits(raw: string) {
  const local = normalizePhone(raw)
  if (!isValidPhone(local)) return ''
  return `92${local.slice(1)}`
}
