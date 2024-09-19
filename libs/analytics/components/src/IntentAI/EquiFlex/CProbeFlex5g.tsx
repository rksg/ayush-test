import { commonEquiFlexDetails } from './common'
import { createIntentAIDetails } from './IntentAIDetails'
export { configuration, kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  action: {
    active: commonEquiFlexDetails.action.active,
    inactive: commonEquiFlexDetails.action.inactive
  }
})
