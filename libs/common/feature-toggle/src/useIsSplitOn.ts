import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

enum FeatureFlag {
  ON = 'on',
  OFF = 'off'
}

export function useIsSplitOn (splitName: string): boolean {
  const { tenantId } = useParams()
  const attributes = { tenantId }
  const treatments = useTreatments([splitName], attributes)
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  return treatment === FeatureFlag.ON
}
