// Single source of truth for the business's public contact details.
//
// wa.me requires the full international number as digits only -- no '+',
// spaces, or the domestic leading 0. 0328 7230630 (Pakistan, +92) therefore
// becomes 923287230630.
export const WHATSAPP_NUMBER = '923287230630'
export const WHATSAPP_DISPLAY = '0328 7230630'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export const SERVICE_CITY = 'Lahore'
export const WARRANTY_YEARS = 3
