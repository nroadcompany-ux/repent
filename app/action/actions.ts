'use server';

import { revalidatePath } from 'next/cache';
import { asId } from '@/domain/shared/identity';
import { FOLLOW_UP_CHOICES, type FollowUpChoice } from '@/domain/action/action';
import { chooseFollowUp, completeAction, createAction } from '@/usecase/action';
import { createContext } from '@/app-runtime/session';

export async function createActionAction(formData: FormData): Promise<void> {
  const content = formData.get('content');
  if (typeof content !== 'string') return;

  await createAction(createContext(), { content });

  revalidatePath('/action');
  revalidatePath('/journey');
}

export async function completeActionAction(formData: FormData): Promise<void> {
  const id = formData.get('actionId');
  if (typeof id !== 'string' || id.length === 0) return;

  await completeAction(createContext(), asId(id));

  revalidatePath('/action');
}

function parseChoice(raw: FormDataEntryValue | null): FollowUpChoice | undefined {
  return FOLLOW_UP_CHOICES.find((choice) => choice === raw);
}

/**
 * Records the user's follow-up choice.
 *
 * No failure reason is collected — a failure cause taxonomy is forbidden. Choosing
 * "회개 기록으로 이동" only offers the repentance entry; it never creates a
 * repentance record on the user's behalf.
 */
export async function chooseFollowUpAction(formData: FormData): Promise<void> {
  const id = formData.get('actionId');
  const choice = parseChoice(formData.get('choice'));
  const scheduledFor = formData.get('scheduledFor');

  if (typeof id !== 'string' || id.length === 0 || !choice) return;

  await chooseFollowUp(
    createContext(),
    asId(id),
    choice,
    typeof scheduledFor === 'string' && scheduledFor ? { scheduledFor } : undefined,
  );

  revalidatePath('/action');
  revalidatePath('/action/follow-up');
}
