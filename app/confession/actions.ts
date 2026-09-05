'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { asId } from '@/domain/shared/identity';
import {
  CONFESSION_TYPES,
  PRIVACY_OPTIONS,
  type ConfessionType,
  type PrivacyOption,
} from '@/domain/confession/confession';
import { draftConfession, publishConfession, setConfessionPrivacy } from '@/usecase/confession';
import { createContext } from '@/app-runtime/session';

function parseType(raw: FormDataEntryValue | null): ConfessionType | undefined {
  return CONFESSION_TYPES.find((type) => type === raw);
}

function parsePrivacy(raw: FormDataEntryValue | null): PrivacyOption | undefined {
  return PRIVACY_OPTIONS.find((option) => option === raw);
}

/**
 * Creates the draft, then sends the user to the preview screen. Publishing never
 * happens straight from the compose form — preview always comes first.
 */
export async function draftConfessionAction(formData: FormData): Promise<void> {
  const content = formData.get('content');
  const type = parseType(formData.get('type'));
  const privacy = parsePrivacy(formData.get('privacy'));

  if (typeof content !== 'string' || !type || !privacy) return;

  const result = await draftConfession(createContext(), { type, content, privacy });

  revalidatePath('/confession');

  if (result.ok) {
    redirect(`/confession/preview?confessionId=${result.value.id}`);
  }
}

export async function setPrivacyAction(formData: FormData): Promise<void> {
  const id = formData.get('confessionId');
  const privacy = parsePrivacy(formData.get('privacy'));
  if (typeof id !== 'string' || id.length === 0 || !privacy) return;

  await setConfessionPrivacy(createContext(), asId(id), privacy);
  revalidatePath('/confession/preview');
}

export async function publishConfessionAction(formData: FormData): Promise<void> {
  const id = formData.get('confessionId');
  if (typeof id !== 'string' || id.length === 0) return;

  const result = await publishConfession(createContext(), asId(id));

  revalidatePath('/confession');
  revalidatePath('/journey');

  if (result.ok) redirect('/confession');
}
