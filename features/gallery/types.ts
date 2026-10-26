export type GalleryKind = 'compare' | 'video' | 'image'

export type GalleryItem = {
  id: string
  title: string
  /** service / category label, used for the filter chips */
  service: string
  kind: GalleryKind
  /** compare: the pair */
  beforeUrl: string | null
  afterUrl: string | null
  /** video / image: the file; poster is the video's still frame */
  mediaUrl: string | null
  posterUrl: string | null
  isPublished: boolean
  isFeatured: boolean
}
