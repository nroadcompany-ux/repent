import Link from 'next/link'
import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react'

/**
 * [OPEN — NO FIGMA SOURCE]
 *
 * Figma file MRh882Jk04Htb17cXyccGg contains no Button, Input, Chip or Tab
 * component, and publishes no Variables. Per the Design Implementation
 * Addendum rule 5, these are NOT invented styles presented as approved — every
 * value below is derived only from tokens that ARE verified in the Figma
 * (accent #6c43f3, tint #f5f1ff, line #ececf2, ink ramp, caption/body sizes,
 * and the row radius family) and is reported to the Owner as OPEN.
 */

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white',
  secondary: 'bg-accent-tint text-accent',
  quiet: 'bg-surface text-ink border border-line',
  danger: 'bg-danger-tint text-danger',
}

const BASE =
  'inline-flex h-control w-full items-center justify-center rounded-control text-value font-semibold transition-opacity active:opacity-70 disabled:opacity-40'

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  className = '',
  name,
  value,
}: {
  children: ReactNode
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  className?: string
  /** Submit buttons that carry an intent, e.g. 다음 / 임시저장 / 마치기. */
  name?: string
  value?: string
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      name={name}
      value={value}
      className={`${BASE} ${VARIANT[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode
  href: string
  variant?: ButtonVariant
  className?: string
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  )
}

/** Label above a field. caption 11/15 medium, accent — mirrors the InfoRow label. */
export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-caption mb-[6px] block font-medium text-accent">
      {children}
    </label>
  )
}

const FIELD_BASE =
  'w-full rounded-control border border-line bg-surface px-4 text-value text-ink placeholder:text-ink-faint outline-none focus:border-accent'

export function TextField({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD_BASE} h-control ${className}`} />
}

export function TextArea({
  className = '',
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`${FIELD_BASE} resize-none py-3 leading-[22px] ${className}`}
    />
  )
}

/** Segmented control — e.g. `기도 제목 | 기도문`, `나의 기도 | 중보기도`. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="flex gap-2" role="tablist">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onChange(option.value)}
            className={`text-body-sm h-[34px] rounded-chip px-4 font-medium transition-colors ${
              selected ? 'bg-accent text-white' : 'bg-surface text-ink-muted border border-line'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent'
}) {
  return (
    <span
      className={`text-caption inline-flex h-[24px] items-center rounded-chip px-[10px] font-medium ${
        tone === 'accent' ? 'bg-accent-tint text-accent' : 'bg-canvas text-ink-muted'
      }`}
    >
      {children}
    </span>
  )
}
