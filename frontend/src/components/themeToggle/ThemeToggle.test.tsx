import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from '../../stores/theme'
import { ThemeToggle } from '.'

beforeEach(() => {
  document.documentElement.dataset.mode = 'dark'
  useThemeStore.setState({ mode: 'dark' })
})

describe('ThemeToggle', () => {
  it('cambia a modo claro, lo aplica en <html> y lo persiste', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }))

    expect(document.documentElement.dataset.mode).toBe('light')
    expect(localStorage.getItem('snail-race:theme')).toBe('"light"')
    expect(screen.getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeInTheDocument()
  })

  it('se opera con teclado', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(document.documentElement.dataset.mode).toBe('light')
  })
})
