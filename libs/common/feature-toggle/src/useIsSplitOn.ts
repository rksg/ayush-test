import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

import { FeatureFlag } from './types'

export function useIsSplitOn (splitName: string): boolean {
  const { tenantId } = useParams()
  const attributes = { tenantId }
  const treatments = useTreatments([splitName], attributes)
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  if (treatment === FeatureFlag.DEFAULT_TREATMENT_ON) {
    return true
  } else if (treatment === FeatureFlag.DEFAULT_TREATMENT_OFF) {
    return false
  } else {
    return false // for control treatment
  }
}
