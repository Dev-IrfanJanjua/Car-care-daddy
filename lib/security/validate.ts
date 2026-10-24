/** Small, dependency-free input checks shared by every public form action. */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/** Reads a text field, trims it, strips control characters and enforces its length. */
export function text(
  formData: FormData,
  key: string,
  opts: { label: string; max: number; min?: number; required?: boolean }
) {
  const raw = formData.get(key)
  const value = (typeof raw === 'string' ? raw : '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!value) {
    if (opts.required) throw new ValidationError(`${opts.label} is required.`)
    return ''
  }
  if (opts.min && value.length < opts.min) throw new ValidationError(`${opts.label} is too short.`)
  if (value.length > opts.max) throw new ValidationError(`${opts.label} must be ${opts.max} characters or fewer.`)
  return value
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function email(value: string) {
  if (value.length > 120 || !EMAIL.test(value)) throw new ValidationError('Enter a valid email address.')
  return value.toLowerCase()
}

export function integerInRange(raw: unknown, label: string, min: number, max: number) {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < min || n > max) throw new ValidationError(`${label} is not valid.`)
  return n
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (v: string) => UUID.test(v)

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Keeps only real, small images. The extension comes from the verified MIME
 * type, never from the uploaded file name, so a name like "../../x.html" can
 * not influence the storage path.
 */
export function pickImages(files: FormDataEntryValue[], opts: { maxFiles: number; maxBytes: number }) {
  const out: { file: File; ext: string }[] = []
  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue
    const ext = IMAGE_TYPES[entry.type]
    if (!ext) throw new ValidationError('Photos must be JPG, PNG or WebP images.')
    if (entry.size > opts.maxBytes) {
      throw new ValidationError(`Each photo must be under ${Math.round(opts.maxBytes / 1024 / 1024)} MB.`)
    }
    out.push({ file: entry, ext })
  }
  if (out.length > opts.maxFiles) throw new ValidationError(`Attach at most ${opts.maxFiles} photos.`)
  return out
}

/** Only same-site relative paths. Blocks https://evil.com, //evil.com and /\evil.com. */
export function safeRedirectPath(value: string, fallback = '/admin') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback
  }
  return value
}
