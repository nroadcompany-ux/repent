'use client'

import { useState } from 'react'

/**
 * Copy the given text to the clipboard.
 *
 * The Owner asked for 기도문 to be copyable so a 대표기도 can be reused
 * elsewhere. This copies to the member's own clipboard only — nothing is sent
 * anywhere, and this is not the Export feature (docs/10 HOLD 2).
 */
export function CopyButton({ text, label = '복사하기' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button type="button" onClick={copy} className="text-body-sm font-medium text-accent">
      {state === 'copied' ? '복사했어요' : state === 'failed' ? '복사하지 못했어요' : label}
    </button>
  )
}
