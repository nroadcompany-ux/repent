import { PageHeader } from '@/components/layout/app-header'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'

export default function JourneyMenuPage() {
  return (
    <main>
      <PageHeader title="메뉴" backHref="/journey" />

      <div className="mt-5">
        <SectionHeader title="여정" subtitle="기록과 설정을 빠르게 찾아가세요" />
      </div>
      <div className="mt-[13px]">
        <RowStack>
          <InfoRow label="성경읽기" value="읽은 장 기록" caption="오늘 읽은 장을 이어서 기록해요" href="/journey/bible" />
          <InfoRow label="검색" value="기록 검색" caption="말씀·기도·회개·약속 기록 찾기" href="/journey/search" />
          <InfoRow label="달력" value="날짜별 기록" caption="그날의 기록 다시 보기" href="/journey/calendar" />
          <InfoRow label="내 정보" value="프로필 · 설정" caption="생년월일과 개인 설정 관리" href="/settings" />
        </RowStack>
      </div>
    </main>
  )
}
