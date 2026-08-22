'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// The quote wizard keeps all its state in the URL, so "start over" is a real
// recovery path here -- worth offering instead of the generic error page.
export default function QuoteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <RotateCcw className="size-10 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">We lost your quote</h1>
          <p className="mt-2 text-muted-foreground">
            Something went wrong partway through. Starting over takes under a minute.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" render={<Link href="/quote" />}>
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
