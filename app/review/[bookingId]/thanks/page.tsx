import { CircleCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ReviewThanksPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <CircleCheck className="size-12 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">Thanks for the feedback!</h1>
          <p className="mt-2 text-muted-foreground">It helps other drivers find us.</p>
        </CardContent>
      </Card>
    </main>
  )
}
