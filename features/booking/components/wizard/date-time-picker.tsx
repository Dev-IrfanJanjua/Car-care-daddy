'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { slotsForDate, combineDateAndSlot, isSlotTaken, BOOKING_GAP_MINUTES, type DayHours } from '@/lib/business-hours'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const DAY_LABEL = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' })

function startOfDay(d: Date) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

// Calendar grid is Monday-first, matching the reference and most non-US
// bookings audiences; getDay() is Sunday-first, so this remaps 0-6 to 6-0.
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

/**
 * Replaces the old bare <input type="datetime-local">, which let a customer
 * pick any time at all -- 3am, a Sunday the shop is closed. Selectable days
 * and time slots both come from the real configured business hours (see
 * lib/business-hours.ts), so what's offered always matches when the shop
 * actually operates.
 */
export function DateTimePicker({
  hours,
  booked = [],
  value,
  onChange,
}: {
  hours: DayHours | null
  /** start times (UTC ISO) of bookings that already hold a slot */
  booked?: string[]
  value: Date | null
  onChange: (date: Date) => void
}) {
  const bookedMs = useMemo(() => booked.map((b) => new Date(b).getTime()).filter((n) => !Number.isNaN(n)), [booked])

  // Every slot of a day with whether it is still free. A day with nothing free
  // (closed, or fully booked) is greyed out in the calendar.
  const slotStates = (day: Date) =>
    slotsForDate(hours, day).map((label) => ({
      label,
      taken: isSlotTaken(combineDateAndSlot(day, label), bookedMs),
    }))

  const today = useMemo(() => startOfDay(new Date()), [])
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ?? today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState<Date | null>(value ? startOfDay(value) : null)

  const isCurrentMonth =
    viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
    const leadingBlanks = mondayIndex(firstOfMonth)

    const days: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null)
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))
    }
    return days
  }, [viewMonth])

  const slots = selectedDay ? slotStates(selectedDay) : []
  const anyTaken = slots.some((s) => s.taken)
  const allTaken = slots.length > 0 && slots.every((s) => s.taken)
  const selectedSlotLabel =
    value && selectedDay && sameDay(value, selectedDay)
      ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(value)
      : null

  function pickDay(day: Date) {
    setSelectedDay(day)
  }

  function pickSlot(slot: string) {
    if (!selectedDay) return
    onChange(combineDateAndSlot(selectedDay, slot))
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            disabled={isCurrentMonth}
            aria-label="Previous month"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold">{MONTH_LABEL.format(viewMonth)}</span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />

            const disabled = day < today || !slotStates(day).some((s) => !s.taken)
            const selected = selectedDay && sameDay(day, selectedDay)

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => pickDay(day)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  selected
                    ? 'cursor-pointer bg-gold text-gold-foreground'
                    : disabled
                      ? 'cursor-not-allowed text-muted-foreground/40'
                      : 'cursor-pointer text-foreground hover:bg-muted'
                )}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
        <p className="text-sm font-semibold">Time</p>
        {selectedDay ? (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">{DAY_LABEL.format(selectedDay)}</p>
            {slots.length > 0 ? (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {slots.map(({ label, taken }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={taken}
                      title={taken ? 'Already booked — choose another time' : undefined}
                      onClick={() => pickSlot(label)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-semibold transition-colors',
                        taken
                          ? 'cursor-not-allowed border-dashed border-border bg-muted/50 text-muted-foreground/60 line-through'
                          : selectedSlotLabel === label
                            ? 'cursor-pointer border-brand bg-brand/5 text-gold-ink ring-1 ring-brand/30'
                            : 'cursor-pointer border-border hover:bg-muted'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {anyTaken && (
                  <p role="status" className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {allTaken
                      ? 'We already have bookings for every time on this day — please choose another date.'
                      : `Crossed-out times are taken: we already have a booking for them. We keep ${BOOKING_GAP_MINUTES / 60} hours between jobs, so please choose another time.`}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                We&apos;re closed that day — pick another.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Pick a date to see open times.</p>
        )}
      </div>
    </div>
  )
}
