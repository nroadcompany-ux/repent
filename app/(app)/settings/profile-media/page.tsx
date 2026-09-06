import { PageHeader } from '@/components/layout/app-header'
import { Button, TextField } from '@/components/ui/control'
import { PROFILE_GALLERY_MAX } from '@/domain/product-lock'
import { signedUrl, signedUrls } from '@/lib/storage'
import { requireUser } from '@/lib/supabase/server'
import { PhotoUpload } from '../_components/photo-upload'
import {
  addGalleryPhoto,
  addProfileHashtag,
  deleteGalleryPhoto,
  removeAvatar,
  removeProfileHashtag,
  setAvatar,
} from '../media-actions'

export const dynamic = 'force-dynamic'

/**
 * 프로필 사진 · 갤러리 · 해시태그 (docs/04, AC-07).
 *
 * docs/08: a gallery photo is self-expression, never proof of church
 * membership. This screen says so and never uses the word 인증.
 *
 * [OPEN — NO FIGMA SOURCE] The accessible Figma file has no profile frame, so
 * this is built from existing tokens and components only.
 */

const ERRORS: Record<string, string> = {
  upload: '사진을 올리지 못했어요. 다시 시도해 주세요.',
  save: '저장하지 못했어요. 다시 시도해 주세요.',
  limit: `갤러리는 최대 ${PROFILE_GALLERY_MAX}장까지 올릴 수 있어요.`,
  tag: '해시태그를 입력해 주세요.',
}

export default async function ProfileMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { error, saved } = await searchParams

  const [{ data: profile }, { data: media }, { data: tags }] = await Promise.all([
    supabase.from('profiles').select('avatar_path').eq('id', userId).maybeSingle(),
    supabase
      .from('profile_media')
      .select('id, storage_path, category, caption')
      .eq('user_id', userId)
      .order('sort_order'),
    supabase.from('profile_hashtags').select('tag').eq('user_id', userId).order('tag'),
  ])

  const [avatarUrl, galleryUrls] = await Promise.all([
    signedUrl(supabase, 'avatars', profile?.avatar_path ?? null),
    signedUrls(
      supabase,
      'gallery',
      (media ?? []).map((item) => item.storage_path),
    ),
  ])

  const used = (media ?? []).length

  return (
    <main>
      <PageHeader title="프로필 사진" backHref="/settings" />

      {saved ? (
        <p className="text-body-sm mx-title-gutter mt-2 rounded-control bg-accent-tint px-4 py-3 leading-[21px] text-accent">
          저장했어요.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          {ERRORS[error] ?? '다시 시도해 주세요.'}
        </p>
      ) : null}

      <section className="px-title-gutter pt-5">
        <h2 className="text-section font-semibold text-ink">대표 사진</h2>
        <p className="text-body-sm mt-1 leading-[21px] text-ink-muted">
          고백 공간에서 이름과 함께 보이는 사진 한 장입니다.
        </p>

        {avatarUrl ? (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="현재 대표 사진"
              className="size-[96px] rounded-full object-cover"
            />
            <form action={removeAvatar} className="mt-3">
              <button type="submit" className="text-caption font-medium text-ink-faint">
                대표 사진 지우기
              </button>
            </form>
          </div>
        ) : null}

        <div className="mt-4">
          <PhotoUpload
            userId={userId}
            bucket="avatars"
            action={setAvatar}
            label={avatarUrl ? '다른 사진으로 바꾸기' : '대표 사진 올리기'}
            submitLabel="대표 사진으로 저장"
          />
        </div>
      </section>

      <section className="mt-10 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">갤러리</h2>
        <p className="text-body-sm mt-1 leading-[21px] text-ink-muted">
          {used} / {PROFILE_GALLERY_MAX}장 · 예배와 섬김, 일상의 사진을 담아둘 수 있어요.
        </p>

        {used < PROFILE_GALLERY_MAX ? (
          <div className="mt-4">
            <PhotoUpload
              userId={userId}
              bucket="gallery"
              action={addGalleryPhoto}
              label="사진 추가"
              submitLabel="갤러리에 추가"
              withCaption
            />
          </div>
        ) : (
          <p className="text-body-sm mt-4 rounded-control bg-canvas px-4 py-3 leading-[21px] text-ink-muted">
            갤러리가 가득 찼어요. 사진을 지우면 다시 추가할 수 있습니다.
          </p>
        )}
      </section>

      {used > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-2 px-gutter">
          {(media ?? []).map((item) => {
            const url = galleryUrls.get(item.storage_path)
            return (
              <li key={item.id} className="overflow-hidden rounded-row bg-surface">
                {url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={url}
                    alt={item.caption ?? ''}
                    className="h-[150px] w-full object-cover"
                  />
                ) : null}
                <div className="px-3 py-3">
                  {item.category ? (
                    <p className="text-caption font-medium text-accent">{item.category}</p>
                  ) : null}
                  {item.caption ? (
                    <p className="text-caption mt-[2px] line-clamp-2 text-ink-muted">
                      {item.caption}
                    </p>
                  ) : null}
                  <form action={deleteGalleryPhoto} className="mt-2">
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-caption font-medium text-ink-faint">
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      <section className="mt-10 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">해시태그</h2>
        <p className="text-body-sm mt-1 leading-[21px] text-ink-muted">
          나를 소개하는 말을 몇 개 남겨둘 수 있어요.
        </p>

        <form action={addProfileHashtag} className="mt-4 flex gap-2">
          <TextField name="tag" maxLength={30} placeholder="예: 새벽기도" required />
          <Button type="submit" variant="quiet" className="w-auto shrink-0 px-5">
            추가
          </Button>
        </form>

        {(tags ?? []).length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {(tags ?? []).map((item) => (
              <li key={item.tag}>
                <form action={removeProfileHashtag}>
                  <input type="hidden" name="tag" value={item.tag} />
                  <button
                    type="submit"
                    aria-label={`${item.tag} 해시태그 삭제`}
                    className="text-caption rounded-chip bg-accent-tint px-[10px] py-[6px] font-medium text-accent"
                  >
                    #{item.tag} ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="text-caption mt-10 px-title-gutter pb-4 text-center leading-[20px] text-ink-muted">
        사진은 나를 표현하는 자료일 뿐, 교인임을 확인하는 수단이 아닙니다.
        <br />
        다른 사람의 얼굴이나 개인정보가 담긴 사진은 올리지 말아주세요.
      </p>
    </main>
  )
}
