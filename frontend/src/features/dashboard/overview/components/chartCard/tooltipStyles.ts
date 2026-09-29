import type { CSSProperties } from 'react'

/**
 * Estilo común del tooltip de Recharts con los tokens de la casa. El zIndex
 * lo pone por encima de capas superpuestas a la gráfica (el texto central de
 * la dona), que de otro modo se pintan encima y lo hacen parecer transparente.
 */
export const chartTooltipProps: {
  wrapperStyle: CSSProperties
  contentStyle: CSSProperties
  itemStyle: CSSProperties
  labelStyle: CSSProperties
} = {
  wrapperStyle: { zIndex: 2, outline: 'none' },
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 8,
    boxShadow: 'var(--shadow)',
    color: 'var(--text)',
  },
  itemStyle: { color: 'var(--text)' },
  labelStyle: { color: 'var(--text)', fontWeight: 700 },
}
