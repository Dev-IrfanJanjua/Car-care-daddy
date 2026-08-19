import { Progress } from '@/components/ui/progress'

const STEPS = ['Vehicle', 'Services', 'Quote', 'Booking']

export function QuoteProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={i + 1 === step ? 'font-medium text-foreground' : 'text-muted-foreground'}
          >
            {label}
          </span>
        ))}
      </div>
      <Progress value={(step / STEPS.length) * 100} className="mt-2" />
    </div>
  )
}
