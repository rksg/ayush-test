import { useContext, useDebugValue } from 'react'

import { SplitContext } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

import { FeatureFlag } from './feature-flag-model'

export function useSplitTreatment (splitName: string): boolean {
  const { isReady, client } = useContext(SplitContext)
  const { tenantId } = useParams()
  const attributes = { tenantId }
  const treatment = isReady
    ? client?.getTreatment(splitName, attributes)
    : FeatureFlag.DEFAULT_TREATMENT_OFF
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  if (treatment === FeatureFlag.DEFAULT_TREATMENT_ON) {
    return true
  } else if (treatment === FeatureFlag.DEFAULT_TREATMENT_OFF) {
    return false
  } else {
    return false
  }
}
