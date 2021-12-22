# `exo-use-stripe-webhook`

> Exobase hook that will verify, validate, and parse incoming webhook request from Stripe

## Install

```
yarn add exo-use-stripe-webhook
```

## Usage

```ts
import _ from 'radash'
import { useStripeWebhook, StripeWebhookArgs } from 'exo-use-stripe-webhook'
import type { Props } from '@exobase/core'

async function handleStripeEvent({ args }: Props<StripeWebhookArgs>) {
  console.log('type: ', args.type)
  console.log('payload: ', JSON.stringify(args.payload))
}

export default _.compose(
  useLambda(),
  useStripeWebhook(''),
  handleStripeEvent
)
```
