'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { CircleCheck, Mail } from 'lucide-react'
import { captureQuoteLead, type QuoteLeadState } from '@/lib/actions/quotes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      <Mail className="size-4" data-icon="inline-start" />
      {pending ? 'Sending…' : 'Email my quote'}
    </Button>
  )
}

const INITIAL: QuoteLeadState = { ok: false, error: null }

export function EmailQuoteForm({
  make,
  model,
  year,
  vehicleClass,
  services,
}: {
  make: string
  model: string
  year: string
  vehicleClass: string
  services: string
}) {
  const [state, formAction] = useActionState(captureQuoteLead, INITIAL)

  if (state.ok) {
    return (
      <Alert className="mt-4">
        <CircleCheck className="size-4 text-brand" />
        <AlertDescription>
          Sent — check your inbox. Your prices hold for 7 days.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="make" value={make} />
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="year" value={year} />
      {/* class was previously dropped, leaving the lead without a vehicle class
          and the total impossible to recompute. */}
      <input type="hidden" name="class" value={vehicleClass} />
      <input type="hidden" name="services" value={services} />

      <Input name="fullName" placeholder="Full name" />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="phone" type="tel" placeholder="Phone (optional)" />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton />
    </form>
  )
}
