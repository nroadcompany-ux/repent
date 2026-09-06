import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'

import './globals.css'

/**
 * Figma specifies Inter. Korean glyphs are not in Inter's Latin subset, so
 * Noto Sans KR carries them at the matching weights. Both are self-hosted by
 * next/font, so no external stylesheet is fetched at runtime.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-kr',
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
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body>
        {/* The design is a 390px mobile frame; centre it instead of stretching. */}
        <div className="mx-auto min-h-dvh max-w-frame bg-canvas">{children}</div>
      </body>
    </html>
  )
}
