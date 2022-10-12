import { useContext, useDebugValue } from 'react'

import { SplitContext } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'
import { Region, Tier, Vertical } from './types'

// For MSP flows will be handled in separate jira - ACX-7910

export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const { isReady, client } = useContext(SplitContext)
  const jwtPayload = getJwtTokenPayload()
  const { tenantId } = useParams()
  const splitName = 'ACX-PLM-FF' // This value mostly will be onetime as defined by PLM (need to confirm)
  const attributes = {
    tenantId: tenantId,
    tier: jwtPayload.acx_account_tier,
    region: jwtPayload.acx_account_regions[2],
    vertical: jwtPayload.acx_account_vertical
  }

  let userFFConfig = []

  if (isReady) {
    const treatmentValue = client.getTreatmentWithConfig(splitName, attributes)
    userFFConfig = JSON.parse(treatmentValue?.config)
  }
  useDebugValue(`${splitName}: treatment`) // used to display a label for custom hooks in React DevTools
  return {
    featureList: userFFConfig?.['featureListDefault'],
    betaList: userFFConfig?.['betaList']
  }
}

export function useSplitTreatmentWithConfig (featureId: string): object {
  const {
    featureList = [],
    betaList = []
  } = useFFList()
  return {
    enable: featureList.includes(featureId),
    beta: betaList.includes(featureId)
  }
}
