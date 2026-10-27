import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { setReviewPublic, deleteReview } from '@/features/admin'
import { ReviewComposer } from '@/features/admin/components/reviews/review-composer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, booking_id, rating, comment, is_public, created_at, reviewer_name, reviewer_city, image_urls, source')
    .order('created_at', { ascending: false })

  const pending = (reviews ?? []).filter((r) => !r.is_public)
  const published = (reviews ?? []).filter((r) => r.is_public)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Reviews customers send (from the link in your &ldquo;Work completed&rdquo; message) are held until you publish them.
          Published reviews appear in the homepage testimonials. You can also add your own below.
        </p>
      </div>

      <ReviewComposer />

      {[
        { label: 'Awaiting review', items: pending, empty: 'Nothing waiting.' },
        { label: 'Published', items: published, empty: 'Nothing published yet.' },
      ].map((group) => (
        <Card key={group.label}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {group.label}
              <Badge variant="outline" className="text-muted-foreground">
                {group.items.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {group.items.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p aria-hidden className="text-brand">
                      {'★'.repeat(r.rating)}
                      <span className="text-border">{'★'.repeat(5 - r.rating)}</span>
                    </p>
                    <span className="sr-only">{r.rating} out of 5 stars</span>
                    {r.reviewer_name && <p className="mt-1 text-sm font-semibold">{r.reviewer_name}{r.reviewer_city ? ` · ${r.reviewer_city}` : ''}</p>}
                    {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                    {r.image_urls?.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {r.image_urls.map((u) => (
                          <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="size-16 overflow-hidden rounded-md border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u} alt="Review photo" loading="lazy" className="size-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()} &middot;{' '}
                      {r.booking_id ? (
                        <Link
                          href={`/admin/bookings/${r.booking_id}`}
                          className="hover:text-foreground hover:underline"
                        >
                          view booking
                        </Link>
                      ) : (
                        'added by you'
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                  <form action={deleteReview.bind(null, r.id)}>
                    <Button type="submit" size="sm" variant="ghost" className="text-red-600">
                      Delete
                    </Button>
                  </form>
                  <form action={setReviewPublic.bind(null, r.id, !r.is_public)}>
                    <Button
                      type="submit"
                      size="sm"
                      variant={r.is_public ? 'ghost' : 'default'}
                      className={r.is_public ? 'bg-muted text-muted-foreground' : undefined}
                    >
                      {r.is_public ? 'Unpublish' : 'Publish'}
                    </Button>
                  </form>
                  </div>
                </li>
              ))}
              {group.items.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {group.empty}
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
