import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { getUserProfile } from '@acx-ui/analytics/utils'
import { get }            from '@acx-ui/config'
import { useTenantId }    from '@acx-ui/utils'
enum FeatureFlag {
  ON = 'on',
  OFF = 'off'
}
const isMLISA = get('IS_MLISA_SA')

export function useIsSplitOn (splitName: string): boolean {
  const tenantId = useTenantId()
  const { accountId } = getUserProfile()
  const tenantKey = isMLISA ? accountId : tenantId
  const attributes = { tenantKey }
  const treatments = useTreatments([splitName], attributes)
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  return treatment === FeatureFlag.ON
}
