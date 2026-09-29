import type { InputHTMLAttributes } from 'react'
import styles from './styles.module.sass'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  error?: string | undefined
  errorId?: string
  hint?: string
}

/** Campo con label visible, pista opcional y error asociado (aria-describedby). */
export function TextField({
  id,
  label,
  error,
  errorId,
  hint,
  ...inputProps
}: Readonly<TextFieldProps>) {
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [hintId, error ? (errorId ?? `${id}-error`) : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId ?? `${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
