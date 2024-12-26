import { useDebugValue } from 'react'

import { useTreatments }     from '@splitsoftware/splitio-react'
import { groupBy, identity } from 'lodash'

import { useTenantId } from '@acx-ui/utils'

/**
 * Intention is to made it possible to check multiple flags and return whether one of flag is "on"
 * Main drive is to allowed checking of R1 and RAI flag (in different Split.IO setup)
 *
 * When all keys return "control" this helper returns `null`
 */
export const useIsTreatmentsOn = (keys: string | string[]) => {
  if (!Array.isArray(keys)) keys = [String(keys)]

  const tenantKey = useTenantId()
  const treatments = useTreatments(keys as string[], { tenantKey })

  useDebugValue(treatments) // used to display a label for custom hooks in React DevTools

  const values = (keys as string[]).map(key => treatments[key].treatment)
  const { on = [], control = [] } = groupBy(values, identity)
  if (control.length === keys.length) return null
  return on.length > 0
}