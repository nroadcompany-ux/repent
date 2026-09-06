import 'server-only'

import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * Storage access.
 *
 * Every bucket is private (docs/07 "Storage에도 Access Policy 적용"), so images
 * are served through short-lived signed URLs minted per request rather than by
 * making a bucket public. Object keys are always `<user_id>/<uuid>.<ext>`,
 * which is what the storage RLS policies match on.
 */

const SIGNED_URL_TTL_SECONDS = 60 * 30

export async function signedUrl(
  supabase: Supabase,
  bucket: 'avatars' | 'gallery' | 'confession' | 'voice',
  path: string | null,
): Promise<string | null> {
  if (!path) return null
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  return data?.signedUrl ?? null
}

/** Batch variant so a feed does not issue one round trip per image. */
export async function signedUrls(
  supabase: Supabase,
  bucket: 'avatars' | 'gallery' | 'confession' | 'voice',
  paths: string[],
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)))
  if (unique.length === 0) return new Map()

  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGNED_URL_TTL_SECONDS)

  const result = new Map<string, string>()
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) result.set(entry.path, entry.signedUrl)
  }
  return result
}

/** `<user_id>/<uuid>.<ext>` — the shape the storage policies require. */
export function objectKey(userId: string, fileName: string): string {
  const extension = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'bin'
  return `${userId}/${crypto.randomUUID()}.${extension}`
}
