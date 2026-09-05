'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { asId } from '@/domain/shared/identity';
import { SOURCE_DELETE_CHOICES, type SourceDeleteChoice } from '@/domain/sharing/share-copy';
import {
  deleteSourceWithChoice,
  listShareableFields,
  publishShareCopy,
} from '@/usecase/sharing';
import { createContext } from '@/app-runtime/session';
import { parseSourceType } from './source-type';

function parseDeleteChoice(raw: FormDataEntryValue | null): SourceDeleteChoice | undefined {
  return SOURCE_DELETE_CHOICES.find((choice) => choice === raw);
}

/**
 * Publishes a snapshot of only the fields the user ticked. Values are read once
 * here and copied by value — the ShareCopy never tracks the source afterwards.
 */
export async function publishShareCopyAction(formData: FormData): Promise<void> {
  const sourceId = formData.get('sourceId');
  const sourceType = parseSourceType(formData.get('sourceType')?.toString());
  const privacy = formData.get('privacy');
  const selectedKeys = new Set(formData.getAll('field').map(String));

  if (typeof sourceId !== 'string' || !sourceType) return;
  if (privacy !== 'masked' && privacy !== 'named') return;
  if (selectedKeys.size === 0) return;

  const ctx = createContext();
  const available = await listShareableFields(ctx, asId(sourceId), sourceType);
  if (!available.ok) return;

  const fields = available.value.filter((field) => selectedKeys.has(field.key));
  if (fields.length === 0) return;

  const result = await publishShareCopy(ctx, {
    sourceId: asId(sourceId),
    sourceType,
    fields,
    privacy,
  });

  revalidatePath('/share');
  revalidatePath('/confession');

  if (result.ok) redirect('/confession');
}

/** Applies the user's explicit keep/delete choice. Nothing cascades by default. */
export async function deleteSourceAction(formData: FormData): Promise<void> {
  const sourceId = formData.get('sourceId');
  const sourceType = parseSourceType(formData.get('sourceType')?.toString());
  const choice = parseDeleteChoice(formData.get('choice'));

  if (typeof sourceId !== 'string' || !sourceType || !choice) return;

  const result = await deleteSourceWithChoice(createContext(), asId(sourceId), sourceType, choice);

  revalidatePath('/journey');
  revalidatePath('/prayer');
  revalidatePath('/repentance');

  if (result.ok) redirect('/journey');
}
