import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { setReviewPublic } from '@/lib/actions/admin/reviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, booking_id, rating, comment, is_public, created_at')
    .order('created_at', { ascending: false })

  const pending = (reviews ?? []).filter((r) => !r.is_public)
  const published = (reviews ?? []).filter((r) => r.is_public)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          New reviews are held until you publish them. Published reviews appear in the homepage
          testimonials.
        </p>
      </div>

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
                    {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()} &middot;{' '}
                      <Link
                        href={`/admin/bookings/${r.booking_id}`}
                        className="hover:text-foreground hover:underline"
                      >
                        view booking
                      </Link>
                    </p>
                  </div>
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
