import _ from 'radash'
import type { Props, ApiFunction } from '@exobase/core'
import exo from '@exobase/core'
import Stripe from 'stripe'


const defaultErrors = {
  misingSignatureHeader: exo.errors.badRequest({
    details: 'Missing required stripe signature header',
    key: 'exo.use-stripe-webhook.nana'
  }),
  unknownVerifyError: exo.errors.unknown({
    details: 'Error encountered while trying to validate webhook signature',
    key: 'exo.use-stripe-webhook.marlin'
  })
}

export type Errors = typeof defaultErrors

export type StripeWebhookArgs = {
  type: string
  payload: Stripe.Event.Data
}

type Options = {
  webhookSecret: string
  stripeSecretKey: string
  errors?: Errors
}

export async function withStripeWebhook(func: ApiFunction, opts: Options, props: Props) {
  const errors = opts.errors ?? defaultErrors
  const stripe = new Stripe(opts.stripeSecretKey, {
    apiVersion: '2020-08-27'
  })
  const signature = props.req.headers['stripe-signature'] as string
  if (!signature) {
    throw errors.misingSignatureHeader
  }
  // See: https://github.com/octokit/webhooks-methods.js/#sign
  const [err, event] = await _.try(() => {
    return stripe.webhooks.constructEvent(
      JSON.stringify(props.req.body) + '\n',
      signature,
      opts.webhookSecret
    )
  })()
  if (err) {
    throw errors.unknownVerifyError
  }
  const args: StripeWebhookArgs = {
    type: event.type,
    payload: event.data
  }
  return await func({
    ...props,
    args: {
      ...props.args,
      ...args
    }
  })
}

/**
 * Validates the signature of the incoming webhook payload
 * given the provided secret.
 */
export const useStripeWebhook = (opts: {
  webhookSecret: string
  stripeSecretKey: string
  errors?: Errors
}) => {
  return (func: ApiFunction) => _.partial(withStripeWebhook, func, opts)
}
