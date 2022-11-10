import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useParams }          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'

import { defaultConfig } from './types'

export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const jwtPayload = getJwtTokenPayload()
  const { tenantId } = useParams()
  const attributes = {
    // @ts-ignore
    tier: jwtPayload.acx_account_tier,
    // @ts-ignore
    vertical: jwtPayload.acx_account_vertical,
    // @ts-ignore
    tenantType: jwtPayload?.tenantType,
    tenantId: tenantId
  }
  const splitName = 'ACX-PLM-FF' // This value mostly will be onetime as defined by PLM (need to confirm)
  let userFFConfig
  const treatments = useTreatments([splitName], attributes)
  // eslint-disable-next-line max-len,no-console
  console.log('treatments:------>jwtObj::::', attributes, treatments, treatments[splitName].config)
  if (JSON.parse(String(treatments[splitName]?.treatment !== 'control')) ) {
    userFFConfig = JSON.parse(String(treatments[splitName]?.config))
  } else {
    userFFConfig = JSON.parse(JSON.stringify(defaultConfig))
  }
  useDebugValue(`${splitName}: treatment`) // used to display a label for custom hooks in React DevTools
  const featureKey = `feature-${attributes?.tenantType}-${attributes?.vertical}`
  return {
    // @ts-ignore
    featureList: userFFConfig[featureKey],
    // @ts-ignore
    betaList: userFFConfig?.['betaList']
  }
}

export function useSplitTreatmentWithConfig (featureId: string): object {
  const {
    featureList = [],
    betaList = []
  } = useFFList()
  // eslint-disable-next-line no-console
  console.log('featureList.includes(featureId): ', featureList.includes(featureId))
  return {
    enable: featureList?.includes(featureId),
    beta: betaList.includes(featureId)
  }
}
