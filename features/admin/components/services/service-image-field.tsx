'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImagePlus, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { createMediaUploadUrl } from '../../actions/brand'
import { setServiceImage } from '../../actions/catalog'

/**
 * A service's photo: shows what customers see now (its own photo, or the default
 * for its category), lets the admin upload a new one, or go back to the default.
 * The new photo is saved the moment the upload finishes.
 */
export function ServiceImageField({ serviceId, name, imageUrl, defaultImage }: { serviceId: string; name: string; imageUrl: string | null; defaultImage: string }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [pending, start] = useTransition()

  async function onFile(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const { path, token, publicUrl } = await createMediaUploadUrl('service', file.name, file.type, file.size)
      const { error } = await createClient().storage.from('site-media').uploadToSignedUrl(path, token, file, { contentType: file.type })
      if (error) throw new Error(`Upload failed: ${error.message}`)
      await setServiceImage(serviceId, publicUrl)
      toast.success('Photo updated on the site')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not upload the photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl || defaultImage} alt={`${name} photo`} className="size-full object-cover" />
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-black/50 text-white">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <ImagePlus className="size-4" /> {imageUrl ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        {imageUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending || uploading}
            onClick={() =>
              start(async () => {
                try {
                  await setServiceImage(serviceId, null)
                  toast.success('Back to the default photo')
                  router.refresh()
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Something went wrong')
                }
              })
            }
          >
            <RotateCcw className="size-3.5" /> Use default
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Using the default photo</span>
        )}
      </div>
    </div>
  )
}
