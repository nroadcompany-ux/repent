import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

/**
 * Figma specifies Inter, and Inter is the only webfont RETURN ships.
 *
 * Hangul is left to the platform. Measured on the live site, bundling
 * Noto Sans KR alongside Inter cost ~127KB across five extra files and
 * declared 395 @font-face rules, because Google splits the Korean face into
 * a hundred-odd unicode-range subsets per weight. On Android the system
 * Korean font IS Noto Sans CJK KR, so the download bought nothing there; on
 * iOS the platform font is Apple SD Gothic Neo.
 *
 * That trade is recorded as a Visual Delta for Owner review: Hangul now
 * renders in the device's own Korean UI font rather than a downloaded one.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RETURN',
  description: '기도와 말씀, 돌아봄과 약속이 시간 속에서 하나의 이야기로 이어집니다.',
  applicationName: 'RETURN',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f7f7fa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body>
        {/* The design is a 390px mobile frame; centre it instead of stretching. */}
        <div className="mx-auto min-h-dvh max-w-frame bg-canvas">{children}</div>
      </body>
    </html>
  )
}
