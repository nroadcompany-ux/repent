import { redirect } from 'next/navigation'

/** Journey is the home surface (docs/01, docs/02). Middleware handles auth. */
export default function RootPage() {
  redirect('/journey')
}
