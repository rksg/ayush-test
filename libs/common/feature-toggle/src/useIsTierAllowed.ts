import { useDebugValue, useMemo } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'
import { useParams }     from 'react-router-dom'

import { useGetAccountTierQuery }                           from '@acx-ui/rc/services'
import { isDelegationMode }                                 from '@acx-ui/rc/utils'
import { useGetBetaStatusQuery }                            from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload } from '@acx-ui/utils'

import { Features }     from './features'
import { useIsSplitOn } from './useIsSplitOn'
type TierKey = `feature-${AccountType}-${AccountVertical}` | 'betaList'

/* eslint-disable max-len, key-spacing */
const defaultConfig: Partial<Record<TierKey, string[]>> = {
  'feature-REC-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD'],
  'feature-REC-Education':   ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD'],
  'feature-MSP-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD', 'PLCY-SGMNT', 'ANLT-ADV'],
  'feature-MSP-Hospitality': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD', 'PLCY-SGMNT', 'ANLT-ADV'],
  'betaList':                ['PLCY-EDGE', 'BETA-CP', 'BETA-CLB', 'BETA-MESH', 'BETA-ZD2R1']
}
/* eslint-enable */

export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const params = useParams()
  const jwtPayload = getJwtTokenPayload()
  // only if it's delgation flow and FF true then call -
  // getBetaStatus value
  const isBetaFFlag = useIsSplitOn(Features.BETA_FLAG) && isDelegationMode()
  const { data } = useGetBetaStatusQuery({ params }, { skip: !isBetaFFlag })
  const betaEnabled = isBetaFFlag? ((data?.enabled === 'true')? true : false)
    : jwtPayload?.isBetaFlag

  const isDelegationTierApi = useIsSplitOn(Features.DELEGATION_TIERING) && isDelegationMode()
  const accTierResponse = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
  const acxAccountTier = accTierResponse?.data?.acx_account_tier?? jwtPayload?.acx_account_tier

  const tenantType = (jwtPayload?.tenantType === AccountType.REC ||
    jwtPayload?.tenantType === AccountType.VAR) ? 'REC' : 'MSP'
  useDebugValue(`JWT tenantType: ${jwtPayload?.tenantType}, Tenant type: ${tenantType}`)
  const treatment = useTreatments([Features.PLM_FF], {
    tier: acxAccountTier,
    vertical: jwtPayload?.acx_account_vertical,
    tenantType: tenantType,
    tenantId: jwtPayload?.tenantId,
    isBetaFlag: betaEnabled
  })[Features.PLM_FF]

  const userFFConfig = useMemo(() => {
    if (treatment?.treatment === 'control') return defaultConfig
    return JSON.parse(String(treatment?.config))
  }, [treatment])

  const featureKey = [
    'feature',
    tenantType,
    jwtPayload?.acx_account_vertical
  ].join('-') as keyof typeof defaultConfig

  return {
    featureList: userFFConfig[featureKey],
    betaList: betaEnabled? userFFConfig['betaList'] : []
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
