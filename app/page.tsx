import { redirect } from 'next/navigation';

/** Journey is the entry surface; Today is a coordinate inside it, not a tab. */
export default function HomePage() {
  redirect('/journey');
}
