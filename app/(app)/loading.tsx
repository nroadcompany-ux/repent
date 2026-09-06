import { LoadingRows } from '@/components/ui/state'

export default function AppLoading() {
  return (
    <main className="pt-24">
      <LoadingRows count={4} />
    </main>
  )
}
