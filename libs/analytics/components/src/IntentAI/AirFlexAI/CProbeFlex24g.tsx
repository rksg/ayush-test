/* eslint-disable max-len */
import { commonAirFlexDetails }  from './common'
import { createIntentAIDetails } from './IntentAIDetails'
export { configuration, kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  reason: commonAirFlexDetails.reason,
  tradeoff: commonAirFlexDetails.tradeoff,
  action: {
    active: commonAirFlexDetails.action.active,
    inactive: commonAirFlexDetails.action.inactive
  }
})