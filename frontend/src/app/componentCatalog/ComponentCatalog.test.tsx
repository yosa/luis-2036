import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { routes } from '../router'

function renderCatalog() {
  const router = createMemoryRouter(routes, { initialEntries: ['/componentes'] })
  render(<RouterProvider router={router} />)
}

describe('catálogo de componentes', () => {
  it('es una ruta pública (sin sesión) cargada aparte', async () => {
    renderCatalog()

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de componentes' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a la aplicación' })).toHaveAttribute('href', '/')
  })

  it('el formulario de ejemplo valida, muestra carga y confirma con los datos transformados', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.type(await screen.findByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Monto'), '250.5')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    expect(await screen.findByText('Datos válidos: ana@example.com · $250.50')).toBeInTheDocument()
  })
})
