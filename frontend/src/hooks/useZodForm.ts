import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import type { z } from 'zod'

type FieldName<S extends z.ZodType> = Extract<keyof z.input<S>, string>
type Values<S extends z.ZodType> = Record<FieldName<S>, string>
type Errors<S extends z.ZodType> = Partial<Record<FieldName<S>, string>>

/**
 * Formulario controlado validado por un esquema zod (la autoridad).
 * Valida al salir de cada campo y al enviar; al enviar con errores mueve el
 * foco al primer campo inválido. Los valores viajan como texto y el esquema
 * los transforma (p. ej. el monto a número).
 */
export function useZodForm<S extends z.ZodType>(options: {
  schema: S
  initialValues: Values<S>
  idPrefix: string
}) {
  const { schema, initialValues, idPrefix } = options
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Errors<S>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fieldId = (name: FieldName<S>) => `${idPrefix}-${name}`
  const errorId = (name: FieldName<S>) => `${fieldId(name)}-error`

  function validate(current: Values<S>): Errors<S> {
    const result = schema.safeParse(current)
    if (result.success) return {}
    const found: Errors<S> = {}
    for (const issue of result.error.issues) {
      const name = issue.path[0] as FieldName<S> | undefined
      if (name !== undefined && found[name] === undefined) found[name] = issue.message
    }
    return found
  }

  function fieldProps(name: FieldName<S>) {
    const error = errors[name]
    return {
      id: fieldId(name),
      name,
      value: values[name],
      error,
      errorId: errorId(name),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const next = { ...values, [name]: event.target.value }
        setValues(next)
        // Si el campo ya mostraba un error, se revalida al escribir para quitarlo en cuanto se corrige.
        if (error) setErrors((previous) => ({ ...previous, [name]: validate(next)[name] }))
      },
      onBlur: () => {
        setErrors((previous) => ({ ...previous, [name]: validate(values)[name] }))
      },
    }
  }

  function handleSubmit(onValid: (data: z.output<S>) => Promise<void> | void) {
    async function submit(data: z.output<S>) {
      setIsSubmitting(true)
      try {
        await onValid(data)
      } finally {
        setIsSubmitting(false)
      }
    }

    // Síncrono para el atributo onSubmit; la parte asíncrona corre aparte.
    return (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      const result = schema.safeParse(values)
      if (result.success) {
        void submit(result.data)
        return
      }
      const found = validate(values)
      setErrors(found)
      const first = Object.keys(found)[0] as FieldName<S> | undefined
      if (first) document.getElementById(fieldId(first))?.focus()
    }
  }

  /** Errores que vienen del servidor o de una regla de negocio (p. ej. correo ya registrado). */
  function setFieldError(name: FieldName<S>, message: string) {
    setErrors((previous) => ({ ...previous, [name]: message }))
    document.getElementById(fieldId(name))?.focus()
  }

  function setValue(name: FieldName<S>, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, isSubmitting, fieldProps, handleSubmit, setFieldError, setValue, reset }
}
