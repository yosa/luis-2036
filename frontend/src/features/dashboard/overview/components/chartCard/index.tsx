import type { ReactNode } from 'react'
import styles from './styles.module.sass'

type ChartCardProps = {
  id: string
  title: string
  summary: string
  children: ReactNode
  /** Vista de tabla con los mismos datos: la gráfica nunca es la única vía (a11y). */
  table: ReactNode
}

export function ChartCard({ id, title, summary, children, table }: Readonly<ChartCardProps>) {
  return (
    <figure className={styles.card} aria-labelledby={`${id}-title`}>
      <figcaption className={styles.caption}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <p className={styles.summary}>{summary}</p>
      </figcaption>
      <div className={styles.chart}>{children}</div>
      <details className={styles.details}>
        <summary>Ver datos en tabla</summary>
        {table}
      </details>
    </figure>
  )
}
