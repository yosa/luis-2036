import { UserPlus } from 'lucide-react'
import { Link } from 'react-router'
import { CenteredLayout } from '../../../app/centeredLayout'
import { Button } from '../../../components/button'
import { TextField } from '../../../components/textField'
import { AuthCard } from '../components/authCard'
import { useRegisterPage } from './useRegisterPage'
import styles from './styles.module.sass'

export function RegisterPage() {
  const { form, onSubmit } = useRegisterPage()

  return (
    <CenteredLayout>
      <AuthCard
        title="Crea tu cuenta"
        subtitle="Empiezas con saldo de $0. Recárgalo cuando quieras apostar por tu caracol favorito."
        footer={
          <>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </>
        }
      >
        <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <TextField label="Nombre completo" autoComplete="name" {...form.fieldProps('fullName')} />
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            {...form.fieldProps('email')}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres, con al menos una letra y un número."
            {...form.fieldProps('password')}
          />
          <TextField
            label="Confirma tu contraseña"
            type="password"
            autoComplete="new-password"
            {...form.fieldProps('confirmPassword')}
          />
          <Button
            type="submit"
            isLoading={form.isSubmitting}
            loadingLabel="Creando tu cuenta…"
            icon={<UserPlus aria-hidden="true" size={18} />}
          >
            Crear cuenta
          </Button>
        </form>
      </AuthCard>
    </CenteredLayout>
  )
}
