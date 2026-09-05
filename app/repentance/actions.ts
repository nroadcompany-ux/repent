'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { asId } from '@/domain/shared/identity';
import type { RepentanceParts } from '@/domain/repentance/repentance';
import {
  finishRepentanceRecord,
  startRepentance,
  updateRepentanceParts,
} from '@/usecase/repentance';
import { createContext } from '@/app-runtime/session';

export async function startRepentanceAction(): Promise<void> {
  await startRepentance(createContext());
  revalidatePath('/repentance');
}

/**
 * Saves whichever parts the user filled in. Any subset is valid — no part is
 * required, nothing is counted, and no progress is computed.
 */
export async function saveRepentancePartsAction(formData: FormData): Promise<void> {
  const id = formData.get('recordId');
  if (typeof id !== 'string' || id.length === 0) return;

  const read = (key: string): string | undefined => {
    const value = formData.get(key);
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const reflection = read('reflection');
  const confession = read('confession');
  const turning = read('turning');

  const parts: RepentanceParts = {
    ...(reflection ? { reflection } : {}),
    ...(confession ? { confession } : {}),
    ...(turning ? { turning } : {}),
  };

  await updateRepentanceParts(createContext(), asId(id), parts);
  revalidatePath('/repentance');
}

/** "회개 기록 마치기" — records that the user finished writing. Not a verdict. */
export async function finishRepentanceAction(formData: FormData): Promise<void> {
  const id = formData.get('recordId');
  if (typeof id !== 'string' || id.length === 0) return;

  const result = await finishRepentanceRecord(createContext(), asId(id));

  revalidatePath('/repentance');
  revalidatePath('/journey');

  if (result.ok) redirect('/repentance');
}
