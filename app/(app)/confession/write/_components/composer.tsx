'use client'

import { useMemo, useState } from 'react'

import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { CONFESSION_PHOTO_MAX, CONFESSION_TYPE_LABELS } from '@/domain/product-lock'
import { createClient } from '@/lib/supabase/client'
import type { ConfessionType, ShareSourceKind } from '@/lib/supabase/database.types'
import { publishConfession } from '../../actions'

/**
 * ShareCopy composer.
 *
 * docs/02 / docs/07 / AC-08:
 *   Private Original → 공유 필드 선택 → ShareCopy Draft → Preview → Publish
 *
 * The four stages are all visible here so the member can see exactly what will
 * become public before it does:
 *   1. every source field starts UNTICKED (Sensitive fields Default OFF)
 *   2. ticking a field appends it to the draft
 *   3. the draft is fully editable — the published copy is a separate object,
 *      not a live view of the private original
 *   4. Preview shows the finished post, then Publish creates the new row
 */

export type SourceField = {
  key: string
  label: string
  body: string
}

export function ShareCopyComposer({
  userId,
  sourceKind,
  sourceId,
  sourceLabel,
  fields,
  initialType = 'daily',
  error,
}: {
  userId: string
  sourceKind?: ShareSourceKind
  sourceId?: string
  sourceLabel?: string
  fields: SourceField[]
  initialType?: ConfessionType
  error?: string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [body, setBody] = useState('')
  const [manual, setManual] = useState(false)
  const [type, setType] = useState<ConfessionType>(initialType)
  const [hashtags, setHashtags] = useState('')
  const [photoPath, setPhotoPath] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'failed'>('idle')
  const [showPreview, setShowPreview] = useState(false)

  const composed = useMemo(
    () =>
      fields
        .filter((field) => selected.includes(field.key))
        .map((field) => `[${field.label}]\n${field.body}`)
        .join('\n\n'),
    [fields, selected],
  )

  // Until the member edits the draft by hand, it tracks their field selection.
  const draft = manual ? body : composed

  function toggleField(key: string) {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
    setManual(false)
  }

  async function uploadPhoto(file: File) {
    setUploadState('uploading')
    const supabase = createClient()
    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
    const key = `${userId}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('confession')
      .upload(key, file, { upsert: false, contentType: file.type })

    if (uploadError) {
      setUploadState('failed')
      return
    }

    setPhotoPath(key)
    setPhotoPreview(URL.createObjectURL(file))
    setUploadState('idle')
  }

  return (
    <form action={publishConfession} className="px-title-gutter pt-4">
      {sourceKind ? <input type="hidden" name="source_kind" value={sourceKind} /> : null}
      {sourceId ? <input type="hidden" name="source_id" value={sourceId} /> : null}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="photo_path" value={photoPath} />

      {error ? (
        <p
          role="alert"
          className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          {error === 'empty' ? '나눌 내용을 적어주세요.' : '올리지 못했어요. 다시 시도해 주세요.'}
        </p>
      ) : null}

      {/* 1 + 2. 공유 필드 선택 */}
      {fields.length > 0 ? (
        <section className="mb-6 rounded-card bg-surface px-4 py-4">
          <p className="text-caption font-medium text-accent">{sourceLabel ?? '원본 기록'}에서 가져오기</p>
          <p className="text-caption mt-1 leading-[19px] text-ink-muted">
            고른 항목만 아래 글에 담깁니다. 아무것도 고르지 않으면 원본은 그대로 비공개로 남습니다.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {fields.map((field) => (
              <li key={field.key}>
                <label className="text-body flex items-start gap-3 text-ink">
                  <input
                    type="checkbox"
                    checked={selected.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="mt-[3px] size-[18px] shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="text-caption block font-medium text-accent">{field.label}</span>
                    <span className="text-caption mt-[2px] line-clamp-2 block text-ink-muted">
                      {field.body}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mb-5">
        <FieldLabel>어떤 이야기인가요</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CONFESSION_TYPE_LABELS) as Array<[ConfessionType, string]>).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                aria-pressed={type === value}
                className={`text-body-sm h-[34px] rounded-chip px-4 font-medium ${
                  type === value
                    ? 'bg-accent text-white'
                    : 'border border-line bg-surface text-ink-muted'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* 3. ShareCopy Draft */}
      <div className="mb-5">
        <FieldLabel htmlFor="body">나눌 내용</FieldLabel>
        <TextArea
          id="body"
          name="body"
          rows={10}
          maxLength={5000}
          value={draft}
          onChange={(event) => {
            setManual(true)
            setBody(event.target.value)
          }}
          placeholder="여기에 적은 내용만 공개됩니다."
          required
        />
        <p className="text-caption mt-2 leading-[19px] text-ink-faint">
          여기에 담긴 글은 원본과 별개로 저장됩니다. 나중에 원본을 고치거나 지워도 이 글은 그대로
          남고, 이 글을 지워도 원본은 사라지지 않습니다.
        </p>
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="photo">사진 (최대 {CONFESSION_PHOTO_MAX}장, 선택)</FieldLabel>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadPhoto(file)
          }}
          className="text-body-sm w-full text-ink-muted file:mr-3 file:rounded-chip file:border-0 file:bg-accent-tint file:px-4 file:py-2 file:text-accent"
        />
        {uploadState === 'uploading' ? (
          <p className="text-caption mt-2 text-ink-muted">올리는 중이에요…</p>
        ) : null}
        {uploadState === 'failed' ? (
          <p className="text-caption mt-2 text-danger">사진을 올리지 못했어요. 다시 시도해 주세요.</p>
        ) : null}
        {photoPreview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photoPreview} alt="" className="mt-3 max-h-[240px] w-full rounded-row object-cover" />
        ) : null}
      </div>

      <div className="mb-6">
        <FieldLabel htmlFor="hashtags">해시태그 (선택)</FieldLabel>
        <TextField
          id="hashtags"
          name="hashtags"
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          maxLength={200}
          placeholder="예: 감사 새벽기도"
        />
      </div>

      {/* 4. Preview → Publish */}
      {showPreview ? (
        <section className="mb-5 rounded-card bg-surface px-4 py-4">
          <p className="text-caption font-medium text-accent">
            {CONFESSION_TYPE_LABELS[type]} · 이렇게 보입니다
          </p>
          <p className="text-body mt-2 whitespace-pre-wrap leading-[25px] text-ink">
            {draft || '아직 내용이 없어요.'}
          </p>
          {photoPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={photoPreview} alt="" className="mt-3 max-h-[240px] w-full rounded-row object-cover" />
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="quiet"
          onClick={() => setShowPreview((current) => !current)}
        >
          {showPreview ? '미리보기 닫기' : '미리보기'}
        </Button>
        <Button type="submit" disabled={draft.trim().length === 0 || uploadState === 'uploading'}>
          고백 나누기
        </Button>
      </div>

      <p className="text-caption mt-5 text-center leading-[20px] text-ink-faint">
        고백에는 순위가 없고, AI가 개입하지 않습니다.
      </p>
    </form>
  )
}
