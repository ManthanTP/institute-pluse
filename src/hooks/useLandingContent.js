import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// In-memory cache to avoid redundant fetches across re-renders
let cachedContent = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 1 minute

export function useLandingContent() {
  const [content, setContent] = useState(cachedContent || {})
  const [loading, setLoading] = useState(!cachedContent)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Return cached data if still fresh
    if (cachedContent && Date.now() - cacheTimestamp < CACHE_TTL) {
      setContent(cachedContent)
      setLoading(false)
      return
    }

    async function fetchContent() {
      try {
        const { data, error: fetchError } = await supabase
          .from('landing_sections')
          .select('section_key, content, is_visible, sort_order')
          .order('sort_order', { ascending: true })

        if (fetchError) throw fetchError

        // Transform array into keyed object: { hero: { ...content, _visible, _order }, ... }
        const contentMap = {}
        data?.forEach(row => {
          contentMap[row.section_key] = {
            ...row.content,
            _visible: row.is_visible,
            _order: row.sort_order,
          }
        })

        cachedContent = contentMap
        cacheTimestamp = Date.now()
        setContent(contentMap)
      } catch (err) {
        console.error('Failed to load landing content:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  return { content, loading, error }
}

// Force cache invalidation (call from admin editor after save)
export function invalidateLandingCache() {
  cachedContent = null
  cacheTimestamp = 0
}
