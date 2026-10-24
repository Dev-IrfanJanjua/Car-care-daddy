import { createClient } from '@/lib/supabase/server'
import { ContentEditor } from '@/features/admin'
import { sanitizeContent } from '@/features/content'

export const metadata = { title: 'Home content' }

export default async function ContentPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('business_settings').select('*').eq('id', true).maybeSingle()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Home content</h1>
        <p className="text-sm text-muted-foreground">Edit the home page text and questions. Preview first, then save.</p>
      </div>
      <ContentEditor initial={sanitizeContent(data?.home_content)} />
    </div>
  )
}
