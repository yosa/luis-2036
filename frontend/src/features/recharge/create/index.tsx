import { CreditCard } from 'lucide-react'
import { Link } from 'react-router'
import { Alert } from '../../../components/alert'
import { Button } from '../../../components/button'
import { TextField } from '../../../components/textField'
import { ChargeHistory } from './components/chargeHistory'
import { TestCards } from './components/testCards'
import { useRechargePage } from './useRechargePage'
import styles from './styles.module.sass'

export function RechargePage() {
  const { form, onSubmit, message, dismissMessage } = useRechargePage()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}>
          ← Volver al dashboard
        </Link>
        <h1>Recargar saldo</h1>
        <p className={styles.lead}>
          El cobro lo procesa SnailPay, nuestra pasarela de pagos simulada.
        </p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="recharge-form-title">
          <h2 id="recharge-form-title" className={styles.cardTitle}>
            Datos de la tarjeta
          </h2>
          {message && (
            <Alert tone={message.tone} title={message.title} onDismiss={dismissMessage}>
              {message.detail}
            </Alert>
          )}
          <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Nombre en la tarjeta"
              autoComplete="cc-name"
              {...form.fieldProps('holderName')}
            />
            <TextField
              label="Número de tarjeta"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              {...form.fieldProps('cardNumber')}
            />
            <div className={styles.row}>
              <TextField
                label="Vencimiento"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                {...form.fieldProps('expiration')}
              />
              <TextField
                label="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
                type="password"
                {...form.fieldProps('cvv')}
              />
            </div>
            <TextField
              label="Monto a recargar (MXN)"
              inputMode="decimal"
              placeholder="250.00"
              hint="Hasta $10,000 por recarga."
              {...form.fieldProps('amount')}
            />
            <Button
              type="submit"
              isLoading={form.isSubmitting}
              loadingLabel="Procesando con SnailPay…"
              icon={<CreditCard aria-hidden="true" size={18} />}
            >
              Recargar
            </Button>
          </form>
        </section>

        <aside className={styles.aside}>
          <TestCards />
          <ChargeHistory />
        </aside>
      </div>
    </div>
  )
}
