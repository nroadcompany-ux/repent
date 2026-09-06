'use client'

import { useRef, useState } from 'react'

import { Button, FieldLabel, TextField } from '@/components/ui/control'
import { createClient } from '@/lib/supabase/client'

/**
 * Uploads one image straight from the browser to a private Supabase bucket,
 * then submits the resulting object path to a server action.
 *
 * The object key is always `<user_id>/<uuid>.<ext>` — the only shape the
 * storage RLS policies accept, so a member cannot write into anyone else's
 * prefix even if this component were tampered with.
 *
 * The file never passes through the Next.js server, so a large photo does not
 * occupy a serverless function.
 */
export function PhotoUpload({
  userId,
  bucket,
  action,
  label,
  submitLabel,
  withCaption = false,
}: {
  userId: string
  bucket: 'avatars' | 'gallery'
  action: (form: FormData) => void
  label: string
  submitLabel: string
  withCaption?: boolean
}) {
  const [storagePath, setStoragePath] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'failed' | 'ready'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setState('uploading')
    const supabase = createClient()
    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
    const key = `${userId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(key, file, { upsert: false, contentType: file.type })

    if (error) {
      setState('failed')
      return
    }

    setStoragePath(key)
    setPreview(URL.createObjectURL(file))
    setState('ready')
  }

  return (
    <form action={action}>
      <input type="hidden" name="storage_path" value={storagePath} />

      <FieldLabel>{label}</FieldLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
        className="text-body-sm w-full text-ink-muted file:mr-3 file:rounded-chip file:border-0 file:bg-accent-tint file:px-4 file:py-2 file:text-accent"
      />

      {state === 'uploading' ? (
        <p className="text-caption mt-2 text-ink-muted">올리는 중이에요…</p>
      ) : null}
      {state === 'failed' ? (
        <p role="alert" className="text-caption mt-2 text-danger">
          사진을 올리지 못했어요. 다시 시도해 주세요.
        </p>
      ) : null}

      {preview ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={preview} alt="" className="mt-3 max-h-[220px] w-full rounded-row object-cover" />
      ) : null}

      {withCaption ? (
        <div className="mt-3 flex flex-col gap-3">
          <TextField name="category" maxLength={20} placeholder="분류 (선택) 예: 예배, 섬김, 일상" />
          <TextField name="caption" maxLength={80} placeholder="설명 (선택)" />
        </div>
      ) : null}

      <div className="mt-3">
        <Button type="submit" variant="secondary" disabled={state !== 'ready'}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
