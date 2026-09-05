import { EmptyState } from '@/ui/components/states';

export default function NotFound() {
  return (
    <main className="shell__main">
      <EmptyState title="화면을 찾을 수 없습니다." />
    </main>
  );
}
