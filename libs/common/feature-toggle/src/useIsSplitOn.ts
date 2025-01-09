import { useDebugValue } from 'react'

import { useTreatments }                from '@splitsoftware/splitio-react'
import { groupBy, identity, castArray } from 'lodash'

import { useTenantId } from '@acx-ui/utils'

export const REMOVABLE_TOGGLE_NAME = 'removable-ff'

enum FeatureFlag {
  ON = 'on',
  OFF = 'off',
  CONTROL = 'control'
}

export const useIsSplitOn = (splitName: string) => {
  const { values } = useTreatmentsValues(splitName)
  return values[0] === FeatureFlag.ON
}

/**
 * Intention is to made it possible to check multiple flags and return whether one of flag is "on"
 * Main drive is to allowed checking of R1 and RAI flag (in different Split.IO setup)
 *
 * When all keys return "control", this helper returns `null`,
 * this happened when Split.IO is trying to resolve value for feature flags given
 *
 * Benefit of using this helper vs useIsSplitOn is that useIsSplitOn will incorrectly stating
 * a feature flag is off when Split.IO helper returns `control`, with `null` returned from this
 * helper, developer can choose to not fire a query so to avoid unexpected query fired.
 */
export const useAnySplitsOn = (splitNames: string | string[]) => {
  const { keys, values } = useTreatmentsValues(splitNames)
  const { on = [], control = [] } = groupBy(values, identity)
  if (control.length === keys.length) return null
  return on.length > 0
}

const useTreatmentsValues = (splitNames: string | string[]) => {
  const keys = castArray(splitNames)
  const treatments = useTreatments(keys, { tenantKey: useTenantId() })

  useDebugValue(treatments)

  const values = keys.some(key => key === REMOVABLE_TOGGLE_NAME)
    ? keys.map(() => FeatureFlag.ON)
    : keys.map(key => treatments[key].treatment as FeatureFlag)

  return { keys, values }
}
