import { CreditCard, LogOut } from 'lucide-react'
import { Link } from 'react-router'
import { Alert } from '../../components/alert'
import { Button } from '../../components/button'
import { TextField } from '../../components/textField'
import { CenteredLayout } from '../centeredLayout'
import { useComponentCatalog } from './useComponentCatalog'
import styles from './styles.module.sass'

/**
 * Catálogo de componentes (/componentes). Muestra el sistema visual y los
 * estados de cada componente en ambos modos, sin pasar por el flujo real. Se
 * carga aparte (lazy): no agrega peso a las pantallas de la aplicación.
 */
export function ComponentCatalog() {
  const { form, submitted, onSubmit } = useComponentCatalog()

  return (
    <CenteredLayout>
      <div className={styles.catalog}>
        <header className={styles.intro}>
          <h1>Catálogo de componentes</h1>
          <p className={styles.hint}>
            Referencia del sistema visual de la aplicación: cada componente en sus estados. Usa el
            botón de sol o luna para verlos en modo claro y oscuro.
          </p>
          <Link to="/">Ir a la aplicación</Link>
        </header>

        <section className={styles.section} aria-labelledby="buttons-title">
          <h2 id="buttons-title">Botones</h2>
          <div className={styles.row}>
            <Button icon={<CreditCard aria-hidden="true" size={18} />}>Recargar saldo</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost" icon={<LogOut aria-hidden="true" size={18} />}>
              Cerrar sesión
            </Button>
            <Button isLoading loadingLabel="Procesando…">
              Cargando
            </Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="alerts-title">
          <h2 id="alerts-title">Alertas</h2>
          <Alert tone="success" title="Recarga aprobada por $250.00">
            Código de autorización: A7K2Q9
          </Alert>
          <Alert tone="error" title="La tarjeta no tiene fondos suficientes." />
          <Alert tone="warning" title="No pudimos confirmar la recarga a tiempo.">
            No se aplicó ningún saldo.
          </Alert>
          <Alert
            tone="info"
            title="Usa solo datos de tarjeta ficticios."
            onDismiss={() => undefined}
          />
        </section>

        <section className={styles.section} aria-labelledby="form-title">
          <h2 id="form-title">Formulario validado (useZodForm)</h2>
          <p className={styles.hint}>
            Sal de un campo vacío o envía el formulario para ver la validación y el foco.
          </p>
          <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <TextField label="Correo electrónico" type="email" {...form.fieldProps('email')} />
            <TextField
              label="Monto"
              inputMode="decimal"
              hint="Entre $1 y $10,000 MXN"
              {...form.fieldProps('amount')}
            />
            <Button type="submit" isLoading={form.isSubmitting} loadingLabel="Enviando…">
              Enviar
            </Button>
          </form>
          {submitted && <Alert tone="success" title={`Datos válidos: ${submitted}`} />}
        </section>
      </div>
    </CenteredLayout>
  )
}
