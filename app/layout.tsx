import type { Metadata, Viewport } from 'next';
import { BottomNav } from '@/ui/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'REPENT',
  description: '개인의 기도·약속·실행·회개·고백을 기록하는 여정',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
