import { commonEquiFlexDetails } from './common'
import { createIntentAIDetails } from './IntentAIDetails'
export { configuration, kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  action: {
    hasData: commonEquiFlexDetails.action.hasData,
    noData: commonEquiFlexDetails.action.noData
  }
})
