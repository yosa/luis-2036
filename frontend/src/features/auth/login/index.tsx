import { LogIn } from 'lucide-react'
import { Link } from 'react-router'
import { CenteredLayout } from '../../../app/centeredLayout'
import { Alert } from '../../../components/alert'
import { Button } from '../../../components/button'
import { TextField } from '../../../components/textField'
import { AuthCard } from '../components/authCard'
import { useLoginPage } from './useLoginPage'
import styles from './styles.module.sass'

export function LoginPage() {
  const { form, onSubmit, credentialsError, dismissError } = useLoginPage()

  return (
    <CenteredLayout>
      <AuthCard
        title="Bienvenido de vuelta"
        subtitle="Entra para ver tu saldo y a los ganadores del día."
        footer={
          <>
            ¿Aún no tienes cuenta? <Link to="/register">Regístrate</Link>
          </>
        }
      >
        {credentialsError && (
          <Alert tone="error" title="Correo o contraseña incorrectos." onDismiss={dismissError} />
        )}
        <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            {...form.fieldProps('email')}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            {...form.fieldProps('password')}
          />
          <Button
            type="submit"
            isLoading={form.isSubmitting}
            loadingLabel="Entrando…"
            icon={<LogIn aria-hidden="true" size={18} />}
          >
            Iniciar sesión
          </Button>
        </form>
      </AuthCard>
    </CenteredLayout>
  )
}
