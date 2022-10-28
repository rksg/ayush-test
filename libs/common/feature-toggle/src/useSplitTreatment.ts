import { useContext, useDebugValue } from 'react'

import { SplitContext, useTreatments } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

import { FeatureFlag } from './types'

export function useSplitTreatment (splitName: string): boolean {
  const { tenantId } = useParams()
  const attributes = { tenantId }
  const { isReady }= useContext(SplitContext)
  // const { isReady } = context
  const treatments = useTreatments([splitName], attributes)
  // console.log(context)
  // eslint-disable-next-line no-console
  console.log(`---------->>>>>isReady: ${isReady}`)
  const treatment = treatments[splitName].treatment
  useDebugValue(`${splitName}: ${treatment}`) // used to display a label for custom hooks in React DevTools
  if (!isReady ) return false
  if (treatment === FeatureFlag.DEFAULT_TREATMENT_ON) {
    return true
  } else if (treatment === FeatureFlag.DEFAULT_TREATMENT_OFF) {
    return false
  } else {
    return false
  }
}
