import Image from 'next/image'
import { Star } from 'lucide-react'
import { Reveal } from './reveal'

type Testimonial = {
  name: string
  comment: string
  rating: number
  avatar: number
}

const placeholders: Testimonial[] = [
  {
    name: 'Sarah M.',
    comment: 'My windshield looked brand new after they were done. No more glare on my commute!',
    rating: 5,
    avatar: 47,
  },
  {
    name: 'James T.',
    comment: 'Headlight restoration was a game changer — night driving feels so much safer now.',
    rating: 5,
    avatar: 13,
  },
  {
    name: 'Priya K.',
    comment: 'Had a crack spreading across my windshield. Replaced in my driveway the next morning.',
    rating: 5,
    avatar: 44,
  },
  {
    name: 'Daniel R.',
    comment: 'Showed up on time, worked fast, and the pricing was exactly what I was quoted.',
    rating: 5,
    avatar: 52,
  },
  {
    name: 'Alicia F.',
    comment: 'Super convenient — they came to my office parking lot while I worked.',
    rating: 4,
    avatar: 25,
  },
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-80 shrink-0 rounded-2xl border border-border/60 bg-card p-6">
      <p aria-hidden className="text-brand">
        {'★'.repeat(testimonial.rating)}
        <span className="text-border">{'★'.repeat(5 - testimonial.rating)}</span>
      </p>
      <span className="sr-only">{testimonial.rating} out of 5 stars</span>
      <p className="mt-3 text-sm text-muted-foreground">&ldquo;{testimonial.comment}&rdquo;</p>
      <div className="mt-4 flex items-center gap-2">
        <Image
          src={`https://i.pravatar.cc/64?img=${testimonial.avatar}`}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="size-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium">{testimonial.name}</span>
      </div>
    </div>
  )
}

export function TestimonialsSection({
  reviews,
}: {
  reviews?: { rating: number; comment: string | null }[]
}) {
  const fromDb: Testimonial[] = (reviews ?? [])
    .filter((r) => r.comment)
    .map((r, i) => ({
      name: 'Verified customer',
      comment: r.comment!,
      rating: r.rating,
      avatar: (i % 70) + 1,
    }))

  const items = fromDb.length > 0 ? fromDb : placeholders
  const looped = [...items, ...items]

  return (
    <section className="py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What drivers say</h2>
        <p className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
          <Star className="size-4 fill-brand text-brand" />
          Rated 4.9/5 by our customers
        </p>
      </Reveal>

      <div className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex w-max gap-5 group-hover:[animation-play-state:paused]">
          {looped.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
