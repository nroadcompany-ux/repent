'use server';

import { revalidatePath } from 'next/cache';
import { recordPrayer } from '@/usecase/prayer';
import { createContext } from '@/app-runtime/session';

/**
 * Records a prayer. Optional extensions stay optional — submitting only the
 * prayer body is the Prayer Only Exit and is a complete outcome.
 *
 * There is deliberately no response/answered field to write.
 */
export async function recordPrayerAction(formData: FormData): Promise<void> {
  const content = formData.get('content');
  const reflection = formData.get('reflection');
  if (typeof content !== 'string') return;

  const trimmedReflection = typeof reflection === 'string' ? reflection.trim() : '';

  await recordPrayer(createContext(), {
    content,
    ...(trimmedReflection ? { extensions: { reflection: trimmedReflection } } : {}),
  });

  revalidatePath('/prayer');
  revalidatePath('/journey');
}
