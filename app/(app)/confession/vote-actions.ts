'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/supabase/server'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Owner UI: one mutually-exclusive 👍/👎 choice per member/post, toggleable. */
export async function toggleSimpleReaction(form: FormData) {
  const { supabase, userId } = await requireUser()
  const postId = text(form, 'post_id')
  const type = text(form, 'type')
  const returnTo = text(form, 'return_to') || '/confession'

  if (!postId || (type !== 'like' && type !== 'dislike')) redirect(returnTo)

  const { data: existing } = await supabase
    .from('confession_reactions')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (String(existing?.type ?? '') === type) {
    await supabase
      .from('confession_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
  } else {
    await supabase
      .from('confession_reactions')
      .upsert(
        { post_id: postId, user_id: userId, type } as never,
        { onConflict: 'post_id,user_id' },
      )
  }

  revalidatePath('/confession')
  revalidatePath(`/confession/${postId}`)
  redirect(returnTo)
}
