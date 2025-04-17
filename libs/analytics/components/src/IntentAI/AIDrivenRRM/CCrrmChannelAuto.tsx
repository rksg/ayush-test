import { Features, useAnySplitsOn } from '@acx-ui/feature-toggle'

import { IntentAIDetails as Details }             from './IntentAIDetails'
import { IntentAIDetailsLegacy as DetailsLegacy } from './IntentAIDetailsLegacy'

export { kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

function createIntentAIDetails () {
  return function IntentAIDetailsVersion () {
    const isAIDrivenRRMMetricsEnabled = useAnySplitsOn(
      [Features.AI_DRIVEN_RRM_METRICS_TOGGLE, Features.RUCKUS_AI_AI_DRIVEN_RRM_METRICS_TOGGLE])
    return isAIDrivenRRMMetricsEnabled ? <Details /> : <DetailsLegacy />
  }
}

export const IntentAIDetails = createIntentAIDetails()
