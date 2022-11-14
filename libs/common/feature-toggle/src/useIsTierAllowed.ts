import { useDebugValue, useMemo } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'

import { AccountType, AccountVertical, getJwtTokenPayload } from '@acx-ui/utils'

import { Features } from './features'

type TierKey = `feature-${AccountType}-${AccountVertical}` | 'betaList'

/* eslint-disable max-len, key-spacing */
const defaultConfig: Partial<Record<TierKey, string[]>> = {
  'feature-REC-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY ESNTLS', 'API-CLOUD'],
  'feature-REC-Education':   ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY ESNTLS', 'API-CLOUD'],
  'feature-MSP-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY ESNTLS', 'PLCY-SGMNT', 'API-CLOUD'],
  'feature-MSP-Hospitality': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY ESNTLS', 'PLCY-SGMNT', 'API-CLOUD'],
  'betaList':                []
}
/* eslint-enable */

export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const jwtPayload = getJwtTokenPayload()
  const treatment = useTreatments([Features.PLM_FF], {
    tier: jwtPayload?.acx_account_tier,
    vertical: jwtPayload?.acx_account_vertical,
    tenantType: jwtPayload?.tenantType,
    tenantId: jwtPayload?.tenantId
  })[Features.PLM_FF]

  const userFFConfig = useMemo(() => {
    if (treatment?.treatment === 'control') return defaultConfig
    return JSON.parse(String(treatment?.config))
  }, [treatment])

  // eslint-disable-next-line max-len
  const featureKey = [
    'feature',
    jwtPayload?.tenantType,
    jwtPayload?.acx_account_vertical
  ].join('-') as keyof typeof defaultConfig

  return {
    featureList: userFFConfig[featureKey],
    betaList: userFFConfig['betaList']
  }
}

export function useIsTierAllowed (featureId: string): boolean {
  const {
    featureList = [],
    betaList = []
  } = useFFList()
  const enabled = featureList?.includes(featureId) || betaList.includes(featureId)
  // eslint-disable-next-line max-len
  useDebugValue(`PLM CONFIG: featureList: ${featureList}, betaList: ${betaList}, ${featureId}: ${enabled}`)
  return enabled
}
