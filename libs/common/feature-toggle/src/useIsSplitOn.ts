import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useTenantId } from '@acx-ui/utils'

enum FeatureFlag {
  ON = 'on',
  OFF = 'off'
}

export type UseSplitOnType = (splitName: string) => boolean

export const useIsSplitOn: UseSplitOnType = (splitName) => {
  const tenantKey = useTenantId()
  const treatments = useTreatments([splitName], { tenantKey })
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  if(splitName === 'removable-ff') {
    return true
  }
  return treatment === FeatureFlag.ON
}