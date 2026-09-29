import { useState } from 'react'
import { HttpNetworkError, HttpTimeoutError } from '../../../lib/http/errors'
import { toCents } from '../../../lib/money/money'
import { createCharge } from '../../../services/snailpay'
import { useSessionStore } from '../../../stores/session'
import { useWalletStore } from '../../../stores/wallet'
import { useZodForm } from '../../../hooks/useZodForm'
import { describeOutcome, type OutcomeMessage, type RechargeOutcome } from '../describeOutcome'
import { FIELD_BY_CONTRACT, rechargeFormSchema, type RechargeForm } from '../schema'

/**
 * Contenedor de la recarga: arma la solicitud con el usuario de la sesión,
 * llama a SnailPay, registra el cobro en el monedero (que decide si acredita)
 * y traduce cualquier resultado a un mensaje.
 */
export function useRechargePage() {
  const user = useSessionStore((state) => state.user)
  const recordCharge = useWalletStore((state) => state.recordCharge)
  const [message, setMessage] = useState<OutcomeMessage | null>(null)
  const form = useZodForm({
    schema: rechargeFormSchema,
    initialValues: { holderName: '', cardNumber: '', expiration: '', cvv: '', amount: '' },
    idPrefix: 'recharge',
  })

  async function charge(data: RechargeForm): Promise<RechargeOutcome> {
    if (!user) return { kind: 'unexpected' }
    const requestedAmountCents = toCents(data.amount)
    try {
      const { httpStatus, response } = await createCharge({
        card_number: data.cardNumber,
        expiration: data.expiration,
        cvv: data.cvv,
        holder_name: data.holderName,
        amount: data.amount,
        payer_id: user.id,
        payer_email: user.email,
      })
      const { credited } = recordCharge({ httpStatus, response, requestedAmountCents })

      for (const fieldError of response.field_errors ?? []) {
        const field = FIELD_BY_CONTRACT[fieldError.field]
        if (field) form.setFieldError(field, 'SnailPay rechazó este dato. Revísalo.')
      }

      return {
        kind: 'charge',
        httpStatus,
        statusDetail: response.status_detail,
        credited,
        authorizationCode: response.authorization_code,
        reference: response.reference,
        amountCents: requestedAmountCents,
        balanceCents: useWalletStore.getState().balanceCents,
      }
    } catch (error) {
      if (error instanceof HttpTimeoutError) return { kind: 'timeout' }
      if (error instanceof HttpNetworkError) return { kind: 'network' }
      return { kind: 'unexpected' }
    }
  }

  async function onSubmit(data: RechargeForm) {
    setMessage(null)
    const outcome = await charge(data)
    setMessage(describeOutcome(outcome))
    // Los datos de tarjeta no se conservan en el formulario (ADR 0006).
    if (outcome.kind === 'charge' && outcome.credited) form.reset()
    else form.setValue('cvv', '')
  }

  return { form, onSubmit, message, dismissMessage: () => setMessage(null) }
}
