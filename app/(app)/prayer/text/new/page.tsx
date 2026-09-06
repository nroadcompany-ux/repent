import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { createPrayerText } from '../../actions'

/**
 * 기도문 — a prayer written in advance. The Owner asked specifically for
 * 대표기도 for 주일예배 / 소모임 기도회, which is what `occasion` records.
 */

const OCCASION_SUGGESTIONS = ['주일예배 대표기도', '소모임 기도회', '식사 기도', '가정예배', '개인 기도문']

export default async function NewPrayerTextPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main>
      <PageHeader title="새 기도문" backHref="/prayer?surface=texts" />

      <form action={createPrayerText} className="px-title-gutter pt-4">
        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {error === 'title' ? '제목을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">제목</FieldLabel>
            <TextField id="title" name="title" maxLength={80} placeholder="예: 3월 첫 주 대표기도" required />
          </div>

          <div>
            <FieldLabel htmlFor="occasion">언제 드리는 기도인가요 (선택)</FieldLabel>
            <TextField
              id="occasion"
              name="occasion"
              list="occasion-suggestions"
              maxLength={40}
              placeholder="예: 주일예배 대표기도"
            />
            <datalist id="occasion-suggestions">
              {OCCASION_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>

          <div>
            <FieldLabel htmlFor="body">기도문</FieldLabel>
            <TextArea
              id="body"
              name="body"
              rows={14}
              maxLength={10000}
              placeholder="미리 준비하는 기도를 적어보세요. 저장한 뒤 복사해서 그대로 쓸 수 있어요."
            />
          </div>
        </div>

        <div className="mt-8">
          <Button type="submit">기도문 저장</Button>
        </div>
      </form>
    </main>
  )
}
