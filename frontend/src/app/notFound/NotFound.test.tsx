import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { NotFound } from '.'

describe('NotFound', () => {
  it('una ruta inexistente muestra la 404 con un enlace de regreso al inicio', async () => {
    const router = createMemoryRouter([{ path: '*', element: <NotFound /> }], {
      initialEntries: ['/no-existe'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Esta pista no existe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})
