import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './styles.module.sass'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  loadingLabel?: string
  icon?: ReactNode
}

/** Botón con estado de carga: se deshabilita y anuncia que está procesando. */
export function Button({
  variant = 'primary',
  isLoading = false,
  loadingLabel = 'Procesando…',
  icon,
  children,
  disabled,
  type = 'button',
  className,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      <span>{isLoading ? loadingLabel : children}</span>
    </button>
  )
}
