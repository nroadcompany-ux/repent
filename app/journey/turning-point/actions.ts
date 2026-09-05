'use server';

import { revalidatePath } from 'next/cache';
import { asId } from '@/domain/shared/identity';
import { confirmJourneyTurningPoint } from '@/usecase/journey';
import { createContext } from '@/app-runtime/session';

/**
 * Confirms a turning point candidate. Only the owner reaches this path; an AI
 * suggestion never becomes final without this explicit user step.
 */
export async function confirmTurningPointAction(formData: FormData): Promise<void> {
  const id = formData.get('turningPointId');
  if (typeof id !== 'string' || id.length === 0) return;

  await confirmJourneyTurningPoint(createContext(), asId(id));

  revalidatePath('/journey/turning-point');
  revalidatePath('/journey');
}
