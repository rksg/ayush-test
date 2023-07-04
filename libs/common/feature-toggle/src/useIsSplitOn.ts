import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useUserProfileContext } from '@acx-ui/analytics/utils'
import { get }                   from '@acx-ui/config'
import { useParams }             from '@acx-ui/react-router-dom'
enum FeatureFlag {
  ON = 'on',
  OFF = 'off'
}
const isMLISA = get('IS_MLISA_SA')

export function useIsSplitOn (splitName: string): boolean {
  const { tenantId } = useParams()
  const { data: userProfile } = useUserProfileContext()
  const tenantKey = isMLISA ? (userProfile?.accountId as string) : tenantId
  const attributes = { tenantKey }
  const treatments = useTreatments([splitName], attributes)
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  return treatment === FeatureFlag.ON
}
