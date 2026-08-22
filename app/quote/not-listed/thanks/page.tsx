import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UnlistedVehicleThanksPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <CircleCheck className="size-12 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">Thanks — we&apos;ve got it</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll price your vehicle by hand and get back to you shortly with an exact quote.
          </p>
          <Button variant="outline" className="mt-6" render={<Link href="/" />}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
