import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '.'

describe('Button', () => {
  it('mientras carga se deshabilita, lo anuncia y no acepta clics', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button isLoading loadingLabel="Enviando…" onClick={onClick}>
        Recargar
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Enviando…' })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('es type="button" por defecto para no enviar formularios por accidente', () => {
    render(<Button>Cancelar</Button>)

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button')
  })
})
