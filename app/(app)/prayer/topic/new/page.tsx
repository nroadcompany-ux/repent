import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { createPrayerTopic } from '../../actions'

const ERRORS: Record<string, string> = {
  title: '기도제목을 입력해 주세요.',
  save: '저장하지 못했어요. 입력하신 내용은 그대로 있습니다. 다시 시도해 주세요.',
}

export default async function NewPrayerTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; error?: string }>
}) {
  const { kind: kindParam, error } = await searchParams
  const kind = kindParam === 'intercession' ? 'intercession' : 'mine'

  return (
    <main>
      <PageHeader title="새 기도제목" backHref={`/prayer?surface=topics&kind=${kind}`} />

      <form action={createPrayerTopic} className="px-title-gutter pt-4">
        <input type="hidden" name="kind" value={kind} />

        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {ERRORS[error] ?? '다시 시도해 주세요.'}
          </p>
        ) : null}

        <SegmentedLinks
          size="sm"
          active={kind}
          options={[
            { value: 'mine', label: '나의 기도', href: '/prayer/topic/new?kind=mine' },
            { value: 'intercession', label: '중보기도', href: '/prayer/topic/new?kind=intercession' },
          ]}
        />

        <div className="mt-6 flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">기도제목</FieldLabel>
            <TextField
              id="title"
              name="title"
              maxLength={80}
              placeholder={kind === 'mine' ? '예: 진로를 두고' : '예: 어머니 건강을 위해'}
              required
            />
          </div>

          {kind === 'intercession' ? (
            <div>
              <FieldLabel htmlFor="subject_name">누구를 위한 기도인가요</FieldLabel>
              <TextField id="subject_name" name="subject_name" maxLength={40} placeholder="예: 어머니" />
            </div>
          ) : null}

          <div>
            <FieldLabel htmlFor="body">배경이나 마음 (선택)</FieldLabel>
            <TextArea
              id="body"
              name="body"
              rows={5}
              maxLength={2000}
              placeholder="왜 이 기도를 시작하게 되었는지 남겨두면 나중에 다시 읽을 때 도움이 돼요."
            />
          </div>
        </div>

        <div className="mt-8">
          <Button type="submit">기도제목 만들기</Button>
        </div>

        <p className="text-caption mt-5 text-center leading-[17px] text-ink-faint">
          기도 기록은 나만 볼 수 있습니다.
        </p>
      </form>
    </main>
  )
}
