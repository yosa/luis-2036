import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '.'

describe('Alert', () => {
  it('un error se anuncia de inmediato (role="alert")', () => {
    render(<Alert tone="error" title="La tarjeta está vencida." />)

    expect(screen.getByRole('alert')).toHaveTextContent('La tarjeta está vencida.')
  })

  it('un éxito se anuncia sin interrumpir (role="status") y muestra el detalle', () => {
    render(
      <Alert tone="success" title="Recarga aprobada">
        Autorización A7K2Q9
      </Alert>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Recarga aprobadaAutorización A7K2Q9')
  })

  it('se puede cerrar con un botón con nombre accesible', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<Alert tone="info" title="Aviso" onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))

    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
