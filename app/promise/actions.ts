'use server';

import { revalidatePath } from 'next/cache';
import { asId } from '@/domain/shared/identity';
import { createPromise, finishPromise } from '@/usecase/promise';
import { createContext } from '@/app-runtime/session';

export async function createPromiseAction(formData: FormData): Promise<void> {
  const content = formData.get('content');
  if (typeof content !== 'string') return;

  await createPromise(createContext(), { content });

  revalidatePath('/promise');
  revalidatePath('/journey');
}

/** Closes a promise as "마무리됨" — the user's own decision, not an assessment. */
export async function finishPromiseAction(formData: FormData): Promise<void> {
  const id = formData.get('promiseId');
  if (typeof id !== 'string' || id.length === 0) return;

  await finishPromise(createContext(), asId(id));

  revalidatePath('/promise');
}
