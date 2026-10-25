'use client'

import { useActionState } from 'react'
import { siteButton } from '@/components/ui/site-button'
import { cn } from '@/lib/utils'
import { sendContactMessage, type MessageState } from '../actions/send-message'

const field =
  'w-full rounded-[10px] border border-line-2 bg-ink-950 px-3.5 py-3 text-[0.95rem] text-chrome-100 placeholder:text-chrome-500 outline-none focus:border-gold-500 dk:rounded-sm'

/** Service names come from the catalog, so the list never drifts from what's offered. */
export function ContactForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState<MessageState, FormData>(sendContactMessage, { ok: false })

  if (state.ok) {
    return (
      <div role="status" className="py-10 text-center">
        <h3 className="font-display text-xl font-semibold text-chrome-100">Message sent</h3>
        <p className="mt-2 text-chrome-400">Thanks — we&apos;ll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form action={action} className="grid gap-4">
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Label text="Name">
          <input name="fullName" required maxLength={80} autoComplete="name" className={field} />
        </Label>
        <Label text="Phone">
          <input name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="03XX XXXXXXX" className={field} />
        </Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label text="Email (optional)">
          <input name="email" type="email" maxLength={120} autoComplete="email" className={field} />
        </Label>
        <Label text="Service">
          <select name="service" defaultValue="" className={field}>
            <option value="">Not sure yet</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Label>
      </div>
      <Label text="Message">
        <textarea name="message" required minLength={5} maxLength={1000} rows={5} className={cn(field, 'resize-y')} />
      </Label>
      {state.error && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={cn(siteButton(), 'justify-self-start disabled:opacity-60')}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[0.82rem] font-medium text-chrome-400">
      {text}
      {children}
    </label>
  )
}
