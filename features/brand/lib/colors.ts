export const HEX_RE = /^#[0-9a-fA-F]{6}$/

function channel(c: number) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance of '#rrggbb'. */
export function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

/** Text colour that stays readable on a solid fill of `hex`. */
export function foregroundOn(hex: string) {
  return luminance(hex) > 0.35 ? '#1a1406' : '#ffffff'
}
