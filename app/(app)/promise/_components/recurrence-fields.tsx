'use client'

import { useState } from 'react'

import { FieldLabel } from '@/components/ui/control'

const WEEKDAYS = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 0, label: '일' },
]

type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export function RecurrenceFields({
  defaultType = 'none',
  defaultWeekdays = [],
}: {
  defaultType?: RepeatType
  defaultWeekdays?: number[]
}) {
  const [repeatType, setRepeatType] = useState<RepeatType>(defaultType)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel htmlFor="repeat_type">반복</FieldLabel>
        <select
          id="repeat_type"
          name="repeat_type"
          value={repeatType}
          onChange={(event) => setRepeatType(event.target.value as RepeatType)}
          className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent"
        >
          <option value="none">반복 안 함</option>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="yearly">매년</option>
        </select>
        <p className="text-caption mt-2 leading-[19px] text-ink-faint">
          월간은 시작일의 날짜에, 연간은 시작일의 월·일에 반복됩니다.
        </p>
      </div>

      {repeatType === 'weekly' ? (
        <fieldset>
          <legend className="text-body-sm mb-2 font-medium text-accent">매주 무슨 요일인가요?</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <label key={day.value} className="text-body-sm flex items-center gap-2 rounded-chip border border-line bg-surface px-3 py-2 text-ink">
                <input
                  type="checkbox"
                  name="repeat_weekdays"
                  value={day.value}
                  defaultChecked={defaultWeekdays.includes(day.value)}
                  className="accent-accent"
                />
                {day.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}
