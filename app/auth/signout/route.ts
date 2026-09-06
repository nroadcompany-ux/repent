import { NextResponse } from 'next/server'

import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(`${siteOrigin()}/login`, { status: 303 })
}
