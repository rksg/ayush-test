import { FormattedMessage } from 'react-intl'

import { TradeOff, TradeOffProps } from '../../TradeOff'

const headers = [
  <FormattedMessage defaultMessage='Intent Priority' />,
  <FormattedMessage defaultMessage='IntentAI Scope' />
]

export function IntentTradeOff ({ radios, ...props }: Omit<TradeOffProps, 'headers'>) {
  radios = radios.map(radio => ({
    ...radio,
    columns: [radio.children, ...radio.columns]
  }))
  return <TradeOff {...props} {...{ radios, headers }} />
}
