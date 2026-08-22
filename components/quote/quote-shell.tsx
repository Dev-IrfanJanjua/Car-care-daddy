import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuoteProgress } from '@/components/quote-progress'
import { StepTransition } from './step-transition'

export function QuoteShell({
  step,
  hrefs,
  backHref,
  title,
  description,
  children,
}: {
  step: 1 | 2 | 3 | 4
  hrefs?: (string | undefined)[]
  backHref: string
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2" render={<Link href={backHref} />}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>
        <span className="text-xs font-medium text-muted-foreground">Step {step} of 4</span>
      </div>

      <QuoteProgress step={step} hrefs={hrefs} />

      <StepTransition>
        <Card className="border-border/60 shadow-lg shadow-foreground/[0.03]">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </StepTransition>
    </main>
  )
}
