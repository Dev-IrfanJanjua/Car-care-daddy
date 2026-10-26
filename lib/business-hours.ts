// Turns the free-text hours an admin typed into /admin/settings ("10:00 AM -
// 10:00 PM") into real bookable time slots for a given day.
//
// The booking flow used to let a customer pick ANY time via a bare
// <input type="datetime-local"> -- 3am, a Sunday if the shop is closed then,
// whatever. This is what stops that: slots are generated only within the
// hours configured for that day of the week, on the hour, so what a customer
// can pick always matches when the shop actually operates.

export type DayHours = { mon_fri?: string; sat?: string; sun?: string }

function hoursStringFor(hours: DayHours | null | undefined, date: Date): string | null {
  if (!hours) return null
  const day = date.getDay() // 0 = Sunday, 6 = Saturday
  if (day === 0) return hours.sun ?? null
  if (day === 6) return hours.sat ?? null
  return hours.mon_fri ?? null
}

// Matches "10:00 AM - 10:00 PM", "9:00AM-3:00PM", "8 AM - 6 PM" etc. Anything
// that doesn't match this shape (including "Closed") is treated as closed --
// a string an admin can't accidentally break into "always open" or a crash.
const RANGE = /(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i

function parseRange(raw: string): { startHour: number; endHour: number } | null {
  const match = raw.match(RANGE)
  if (!match) return null

  const to24 = (h: string, meridiem: string) => {
    let hour = Number(h) % 12
    if (meridiem.toUpperCase() === 'PM') hour += 12
    return hour
  }

  const startHour = to24(match[1], match[3])
  const endHour = to24(match[4], match[6])
  if (endHour <= startHour) return null

  return { startHour, endHour }
}

/**
 * Hourly slots for `date`, within that day's configured hours. The last slot
 * starts an hour before closing (a 60-90 minute job started right at close
 * would run past it). Past times today are dropped, so "today" never offers a
 * 9am slot at 2pm.
 */
export function slotsForDate(hours: DayHours | null | undefined, date: Date): string[] {
  const raw = hoursStringFor(hours, date)
  if (!raw) return []

  const range = parseRange(raw)
  if (!range) return []

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const slots: string[] = []
  for (let hour = range.startHour; hour < range.endHour; hour++) {
    if (isToday && hour <= now.getHours()) continue
    const period = hour < 12 ? 'AM' : 'PM'
    const display = hour % 12 === 0 ? 12 : hour % 12
    slots.push(`${display}:00 ${period}`)
  }
  return slots
}

/** Whether `date` has any slots at all -- used to grey out closed days in the calendar. */
export function isDayBookable(hours: DayHours | null | undefined, date: Date): boolean {
  return slotsForDate(hours, date).length > 0
}

/** "9:00 AM" + a calendar date -> that instant, in the browser's own timezone. */
export function combineDateAndSlot(date: Date, slotLabel: string): Date {
  const match = slotLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return date

  let hour = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') hour += 12

  const result = new Date(date)
  result.setHours(hour, Number(match[2]), 0, 0)
  return result
}

/**
 * Minimum gap between two jobs. A booking at 2:00 PM keeps the team busy (the
 * work plus travel), so nothing else can start until 4:00 PM -- and, for the
 * same reason, nothing can start in the two hours before it either.
 */
export const BOOKING_GAP_MINUTES = 120

/** True when `slot` starts too close to any already-booked time (ms timestamps). */
export function isSlotTaken(slot: Date, bookedMs: number[]): boolean {
  const gap = BOOKING_GAP_MINUTES * 60 * 1000
  const t = slot.getTime()
  return bookedMs.some((b) => Math.abs(t - b) < gap)
}
