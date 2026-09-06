import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { ServiceWorkerRegistration } from '@/components/pwa/service-worker'
import { PRIMARY_BRAND_COPY } from '@/domain/copy'

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
  description: PRIMARY_BRAND_COPY.subline,
  applicationName: 'RETURN',
  formatDetection: { telephone: false },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'RETURN',
    // Default keeps the iOS status bar legible on the light canvas; a
    // translucent bar would put dark glyphs over the hero.
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Lets the page paint under the iOS notch and home indicator; the bottom nav
  // already reserves env(safe-area-inset-bottom).
  viewportFit: 'cover',
  themeColor: '#f7f7fa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body>
        {/* The design is a 390px mobile frame; centre it instead of stretching. */}
        <div className="mx-auto min-h-dvh max-w-frame bg-canvas">{children}</div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
