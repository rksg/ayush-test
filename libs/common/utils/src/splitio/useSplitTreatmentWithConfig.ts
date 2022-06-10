import { useContext, useDebugValue } from 'react'

import { SplitContext } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

import { Region, Tier, Vertical } from './feature-flag-model'

// TODO: Need to integrate with userProfile service later once it's added into the project,
// for now using static values for tier, region & vertical
// For MSP flows will be handled in separate jira - ACX-7910

export function useFFList () {
  const { isReady, client } = useContext(SplitContext)
  const { tenantId } = useParams()
  const splitName = 'Sara-ACX-PLM' // This value mostly will be onetime as defined by PLM (need to confirm)
  const attributes = {
    tenantId: tenantId,
    tier: Tier.TIER_GOLD, //userProfile.tier, TODO: Need backend support
    region: Region.REGION_NA, //userProfile.region, TODO: Need backend support
    vertical: Vertical.VERTICAL_DEFAULT //userProfile.vertical, TODO: Need backend support
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

export function useEvaluateFeature (featureId: string) {
  return {
    enable: useFFList()?.featureList?.includes(featureId),
    beta: useFFList()['betaList']?.includes(featureId)
  }
}
