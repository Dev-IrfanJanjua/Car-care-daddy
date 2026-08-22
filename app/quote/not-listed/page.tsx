import { captureUnlistedVehicleLead } from '@/lib/actions/quotes'
import { QuoteShell } from '@/components/quote/quote-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function VehicleNotListedPage() {
  return (
    <QuoteShell
      step={1}
      backHref="/quote"
      title="Tell us about your car"
      description="We price a few models by hand. Send us the details and we'll get back to you with an exact quote."
    >
      <form action={captureUnlistedVehicleLead} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="make">Car Brand</Label>
            <Input id="make" name="make" required placeholder="Subaru" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" required placeholder="Outback" className="h-11" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={1950}
            max={new Date().getFullYear() + 1}
            placeholder="2022"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Your name</Label>
          <Input id="fullName" name="fullName" className="h-11" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="h-11" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" className="h-11" />
        </div>

        <Button type="submit" size="lg" className="h-11 w-full text-base">
          Request a quote
        </Button>
      </form>
    </QuoteShell>
  )
}
