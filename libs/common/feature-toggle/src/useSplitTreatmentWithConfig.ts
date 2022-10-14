import { useContext, useDebugValue } from 'react'

import { SplitContext } from '@splitsoftware/splitio-react'

import { useParams }          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'

// For MSP flows will be handled in separate jira - ACX-7910

export function useFFList (): { featureList?: string[], analyticsList?: string[], betaList?: string[] } {
  const { client } = useContext(SplitContext)
  const isReady = client.Event.SDK_READY
  const jwtPayload = getJwtTokenPayload()
  const { tenantId } = useParams()
  // @ts-ignore
  const tier = jwtPayload.acx_account_tier
  // @ts-ignore
  const region = jwtPayload.acx_account_regions[2]
  // @ts-ignore
  const vertical = jwtPayload.acx_account_vertical
  const splitName = 'ACX-PLM-FF' // This value mostly will be onetime as defined by PLM (need to confirm)
  const attributes = {
    tenantId: tenantId,
    tier: tier,
    region: region,
    vertical: vertical
  }

  let userFFConfig = []

  if (isReady) {
    const treatmentValue = client.getTreatmentWithConfig(splitName, attributes)
    console.log('treatmentValue from useSplitTreatmentWithConfig ---> ', tier, region, vertical, treatmentValue)
    userFFConfig = JSON.parse(treatmentValue?.config)
  }
  useDebugValue(`${splitName}: treatment`) // used to display a label for custom hooks in React DevTools
  return {
    featureList: userFFConfig?.['featureListDefault'],
    analyticsList: userFFConfig?.['analyticsList'],
    betaList: userFFConfig?.['betaList']
  }
}

export function useSplitTreatmentWithConfig (featureId: string): object {
  const {
    featureList = [],
    analyticsList = [],
    betaList = []
  } = useFFList()
  return {
    enable: featureList.includes(featureId) || analyticsList.includes((featureId)),
    beta: betaList.includes(featureId)
  }
}
