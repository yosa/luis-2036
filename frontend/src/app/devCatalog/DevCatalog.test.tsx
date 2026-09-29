import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DevCatalog } from '.'

describe('DevCatalog', () => {
  it('el formulario de ejemplo valida, muestra carga y confirma con los datos transformados', async () => {
    const user = userEvent.setup()
    render(<DevCatalog />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Monto'), '250.5')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    expect(await screen.findByText('Datos válidos: ana@example.com · $250.50')).toBeInTheDocument()
  })
})
