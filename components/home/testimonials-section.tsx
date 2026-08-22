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
    name: 'Ayesha K.',
    comment:
      "Water spots on my Corolla's windshield were awful. Completely gone — night driving is so much easier now.",
    rating: 5,
    avatar: 47,
  },
  {
    name: 'Bilal A.',
    comment: 'Wiper marks I thought were permanent came right off. Worth every rupee.',
    rating: 5,
    avatar: 13,
  },
  {
    name: 'Hamza S.',
    comment: 'Booked in the morning, done at my office in DHA the same afternoon. Very convenient.',
    rating: 5,
    avatar: 44,
  },
  {
    name: 'Fatima R.',
    comment: 'Showed up on time and the price was exactly what the website quoted. No surprises.',
    rating: 5,
    avatar: 52,
  },
  {
    name: 'Usman T.',
    comment: 'Got the full glass polish on my Fortuner. The whole car looks newer.',
    rating: 4,
    avatar: 25,
  },
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-80 shrink-0 rounded-2xl border border-border/60 bg-card p-6">
      <p aria-hidden className="text-gold">
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
    <section className="py-8 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          Reviews
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">What drivers say</h2>
        <p className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
          <Star className="size-4 fill-gold text-gold" />
          Rated 4.9/5 by drivers across Lahore
        </p>
      </Reveal>

      <div className="group relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex w-max gap-5 group-hover:[animation-play-state:paused]">
          {looped.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
