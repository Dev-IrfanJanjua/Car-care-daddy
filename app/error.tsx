'use client'

import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <TriangleAlert className="size-10 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">
            That didn&apos;t work as expected. Try again — nothing was charged.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" render={<Link href="/" />}>
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
