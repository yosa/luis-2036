import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { TextField } from '../components/textField'
import { useZodForm } from './useZodForm'

const schema = z.object({
  email: z.email('Escribe un correo válido'),
  age: z.string().regex(/^\d+$/, 'Solo números').transform(Number),
})

function DemoForm({ onValid }: Readonly<{ onValid: (data: z.output<typeof schema>) => void }>) {
  const form = useZodForm({ schema, initialValues: { email: '', age: '' }, idPrefix: 'demo' })
  return (
    <form onSubmit={form.handleSubmit(onValid)} noValidate>
      <TextField label="Correo" {...form.fieldProps('email')} />
      <TextField label="Edad" {...form.fieldProps('age')} />
      <button type="submit">Enviar</button>
    </form>
  )
}

describe('useZodForm', () => {
  it('muestra el error al salir del campo, asociado al input', async () => {
    const user = userEvent.setup()
    render(<DemoForm onValid={vi.fn()} />)

    await user.type(screen.getByLabelText('Correo'), 'no-es-correo')
    await user.tab()

    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Escribe un correo válido')
  })

  it('al enviar con errores no llama onValid y enfoca el primer campo inválido', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<DemoForm onValid={onValid} />)

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onValid).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })

  it('entrega los datos ya transformados por el esquema', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<DemoForm onValid={onValid} />)

    await user.type(screen.getByLabelText('Correo'), 'ana@example.com')
    await user.type(screen.getByLabelText('Edad'), '30')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onValid).toHaveBeenCalledWith({ email: 'ana@example.com', age: 30 })
  })

  it('quita el error en cuanto el campo se corrige', async () => {
    const user = userEvent.setup()
    render(<DemoForm onValid={vi.fn()} />)

    await user.type(screen.getByLabelText('Edad'), 'x')
    await user.tab()
    expect(screen.getByText('Solo números')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Edad'))
    await user.type(screen.getByLabelText('Edad'), '5')

    expect(screen.queryByText('Solo números')).not.toBeInTheDocument()
  })
})
