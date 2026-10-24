'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_CONTENT, LIMITS, type HomeContent } from '@/features/content/client'
import { resetHomeContent, saveHomeContent } from '../../actions/content'

function Field({
  id,
  label,
  value,
  max,
  onChange,
  multiline,
}: {
  id: string
  label: string
  value: string
  max: number
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.length}/{max}
        </span>
      </div>
      {multiline ? (
        <Textarea id={id} value={value} maxLength={max} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

export function ContentEditor({ initial }: { initial: HomeContent }) {
  const router = useRouter()
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [pending, start] = useTransition()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const set = <K extends keyof HomeContent>(k: K, v: HomeContent[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const setPoint = (i: number, v: string) => set('heroPoints', draft.heroPoints.map((p, idx) => (idx === i ? v : p)))
  const setFaq = (i: number, key: 'q' | 'a', v: string) =>
    set('faqs', draft.faqs.map((f, idx) => (idx === i ? { ...f, [key]: v } : f)))
  const moveFaq = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= draft.faqs.length) return
    const next = [...draft.faqs]
    ;[next[i], next[j]] = [next[j], next[i]]
    set('faqs', next)
  }

  function save() {
    start(async () => {
      try {
        const clean = await saveHomeContent(draft)
        setSaved(clean)
        setDraft(clean)
        toast.success('Saved — the home page is updated')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save')
      }
    })
  }

  function reset() {
    start(async () => {
      try {
        await resetHomeContent()
        setSaved(DEFAULT_CONTENT)
        setDraft(DEFAULT_CONTENT)
        toast.success('Back to the built-in text')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not reset')
      }
    })
  }

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="badge" label="Small badge above the headline" value={draft.heroBadge} max={LIMITS.heroBadge} onChange={(v) => set('heroBadge', v)} />
            <Field id="h1" label="Headline" value={draft.heroHeadline} max={LIMITS.heroHeadline} onChange={(v) => set('heroHeadline', v)} />
            <Field id="h1a" label="Headline, second part (accent colour)" value={draft.heroAccent} max={LIMITS.heroAccent} onChange={(v) => set('heroAccent', v)} />
            <Field id="sub" label="Intro text" value={draft.heroSubtext} max={LIMITS.heroSubtext} multiline onChange={(v) => set('heroSubtext', v)} />
            <div className="space-y-2">
              <Label>Four reassurance points</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {draft.heroPoints.map((p, i) => (
                  <Input key={i} aria-label={`Point ${i + 1}`} value={p} maxLength={LIMITS.heroPoint} onChange={(e) => setPoint(i, e.target.value)} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking banner (bottom of the page)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="ct" label="Title" value={draft.ctaTitle} max={LIMITS.ctaTitle} onChange={(v) => set('ctaTitle', v)} />
            <Field id="cx" label="Text" value={draft.ctaText} max={LIMITS.ctaText} multiline onChange={(v) => set('ctaText', v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions &amp; answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.faqs.length === 0 && (
              <p className="text-sm text-muted-foreground">No questions — the section is hidden on the home page.</p>
            )}
            {draft.faqs.map((f, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <Input aria-label={`Question ${i + 1}`} placeholder="Question" value={f.q} maxLength={LIMITS.faqQ} onChange={(e) => setFaq(i, 'q', e.target.value)} />
                <Textarea aria-label={`Answer ${i + 1}`} placeholder="Answer" rows={2} value={f.a} maxLength={LIMITS.faqA} onChange={(e) => setFaq(i, 'a', e.target.value)} />
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => moveFaq(i, -1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => moveFaq(i, 1)} disabled={i === draft.faqs.length - 1} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => set('faqs', draft.faqs.filter((_, idx) => idx !== i))}>
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            {draft.faqs.length < LIMITS.faqCount && (
              <Button type="button" variant="outline" size="sm" onClick={() => set('faqs', [...draft.faqs, { q: '', a: '' }])}>
                <Plus className="size-4" /> Add a question
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Questions with a blank question or answer are dropped when you save.</p>
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-gold-ink">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                {draft.heroBadge}
              </span>
              <p className="mt-3 font-display text-2xl leading-tight font-bold text-chrome-100">
                {draft.heroHeadline} <span className="text-gold-ink">{draft.heroAccent}</span>
              </p>
              <p className="mt-2 text-sm text-chrome-300">{draft.heroSubtext}</p>
              <ul className="mt-3 grid gap-1.5">
                {draft.heroPoints.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-chrome-100">
                    <Check className="size-3.5 text-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-base font-semibold text-foreground">{draft.ctaTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{draft.ctaText}</p>
            </div>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {draft.faqs.filter((f) => f.q && f.a).map((f, i) => (
                <div key={i} className="px-3 py-2">
                  <p className="text-xs font-medium text-foreground">{f.q}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Preview only. The live site changes when you press <strong>Save changes</strong>.
            </p>
          </CardContent>
        </Card>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {dirty ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={reset} disabled={pending}>
              Reset to built-in text
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(saved)} disabled={!dirty || pending}>
              Discard
            </Button>
            <Button type="button" onClick={save} disabled={!dirty || pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
