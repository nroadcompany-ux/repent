'use client'

import { useEffect, useState } from 'react'
import { LoopMark } from '../brand/loop-mark'

/**
 * RETURN Product Education Rolling Banner.
 *
 * Canonical: docs/01 Journey IA item 2, docs/03 "Common Component이며 Page별
 * Copy를 사용한다". Figma 3:6–3:11:
 *   350x152 · radius 26 · bg #f5f1ff · inset 20
 *   hero  24/31 semibold ink   at inner (18, 24), width 220
 *   body  12/18 regular muted  at inner (18, 88), width 236
 *   loop mark at inner (253, 23)
 *   pager 11/14 medium muted, right inset 20, bottom inset 18
 *
 * The banner explains the product. It never reports on the user, never scores
 * them, and never pressures them into a record.
 */

export type EducationSlide = {
  /** Two short lines. Kept as an array so the 24/31 rhythm from Figma holds. */
  headline: [string, string]
  body: [string, string]
}

export function EducationBanner({ slides }: { slides: readonly EducationSlide[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const slide = slides[index] ?? slides[0]
  if (!slide) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label="RETURN 소개"
      className="relative mx-gutter h-[152px] overflow-hidden rounded-banner bg-accent-tint"
    >
      <div className="absolute left-[253px] top-[23px]">
        <LoopMark width={75} />
      </div>

      <div className="relative pl-[18px] pt-6">
        <p className="text-hero w-[220px] font-semibold text-ink">
          {slide.headline[0]}
          <br />
          {slide.headline[1]}
        </p>
        <p className="text-body-sm mt-[8px] w-[236px] leading-[18px] text-ink-muted">
          {slide.body[0]}
          <br />
          {slide.body[1]}
        </p>
      </div>

      {slides.length > 1 ? (
        <p className="text-caption absolute bottom-[18px] right-5 font-medium text-ink-muted">
          {index + 1} / {slides.length}
        </p>
      ) : null}
    </section>
  )
}
