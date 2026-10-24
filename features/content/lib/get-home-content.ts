import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { HomeContent } from '../types'
import { DEFAULT_CONTENT } from './defaults'
import { sanitizeContent } from './sanitize'

export const CONTENT_TAG = 'home-content'

export const getHomeContent = unstable_cache(
  async (): Promise<HomeContent> => {
    try {
      const { data } = await createPublicClient().from('business_settings').select('*').maybeSingle()
      return data?.home_content ? sanitizeContent(data.home_content) : DEFAULT_CONTENT
    } catch {
      return DEFAULT_CONTENT
    }
  },
  ['home-content'],
  { tags: [CONTENT_TAG], revalidate: 3600 }
)
