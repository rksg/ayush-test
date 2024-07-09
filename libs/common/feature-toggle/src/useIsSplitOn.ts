import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useTenantId } from '@acx-ui/utils'

enum FeatureFlag {
  ON = 'on',
  OFF = 'off'
}

export function useIsSplitOn (splitName: string): boolean {
  const tenantKey = useTenantId()
  const treatments = useTreatments([splitName], { tenantKey })
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  return treatment === FeatureFlag.ON
}
