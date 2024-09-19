import { defineMessage } from 'react-intl'

import { createIntentAIDetails } from './IntentAIDetails'
export { configuration, kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  action: {
    active: defineMessage({
      defaultMessage: `Reduce energy footprint for efficiency 
      and sustainability, or operate mission-critical services for
      reliability and continuous operation.` }),
    inactive: defineMessage({
      defaultMessage: `When activated, this Intent takes over 
      the automatic energy saving in the network.` })
  }
})
