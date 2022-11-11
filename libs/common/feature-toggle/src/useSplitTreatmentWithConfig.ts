import { useDebugValue } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { useParams }          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'

import { defaultConfig, JwtPayload } from './types'

export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const jwtPayload:JwtPayload = getJwtTokenPayload()
  const { tenantId } = useParams()
  const attributes = {
    tier: jwtPayload?.acx_account_tier,
    vertical: jwtPayload.acx_account_vertical,
    tenantType: jwtPayload?.tenantType,
    tenantId
  }
  const splitName = 'ACX-PLM-FF' // This value mostly will be onetime as defined by PLM (need to confirm)
  let userFFConfig: typeof defaultConfig
  const treatments = useTreatments([splitName], attributes)
  if (JSON.parse(String(treatments[splitName]?.treatment !== 'control')) ) {
    userFFConfig = JSON.parse(String(treatments[splitName]?.config))
  } else {
    userFFConfig = JSON.parse(JSON.stringify(defaultConfig))
  }
  // eslint-disable-next-line max-len
  const featureKey = `feature-${attributes?.tenantType}-${attributes?.vertical}` as keyof typeof defaultConfig
  return {
    featureList: userFFConfig[featureKey],
    betaList: userFFConfig?.['betaList']
  }
}

export function useSplitTreatmentWithConfig (featureId: string): boolean {
  const {
    featureList = [],
    betaList = []
  } = useFFList()
  useDebugValue(`PLM CONFIG:: Enable: ${featureList.includes(featureId)}
  Beta: ${betaList.includes(featureId)}`)
  return featureList?.includes(featureId) || betaList.includes(featureId)
}
