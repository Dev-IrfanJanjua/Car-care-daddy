import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <Compass className="size-10 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-muted-foreground">
            This link may have expired, or the page never existed.
          </p>
          <div className="mt-6 flex gap-3">
            <Button render={<Link href="/quote" />}>Get a quote</Button>
            <Button variant="outline" render={<Link href="/" />}>
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
