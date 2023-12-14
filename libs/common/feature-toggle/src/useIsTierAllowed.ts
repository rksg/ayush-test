import { useDebugValue, useMemo } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'
import { useParams }     from 'react-router-dom'

import { useGetAccountTierQuery, useGetBetaStatusQuery, useUserProfileContext } from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload, isDelegationMode }   from '@acx-ui/utils'

import { Features }     from './features'
import { useIsSplitOn } from './useIsSplitOn'
type TierKey = `feature-${AccountType}-${AccountVertical}` | 'betaList' | 'alphaList'

/* eslint-disable max-len, key-spacing */
const defaultConfig: Partial<Record<TierKey, string[]>> = {
  'feature-REC-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD'],
  'feature-REC-Education':   ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD'],
  'feature-MSP-Default':     ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD', 'PLCY-SGMNT', 'ANLT-ADV'],
  'feature-MSP-Hospitality': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT','ANLT-STUDIO', 'PLCY-ESNTLS', 'API-CLOUD', 'PLCY-SGMNT', 'ANLT-ADV'],
  'betaList':                ['PLCY-EDGE', 'BETA-CP', 'BETA-ZD2R1']
}
/* eslint-enable */

export function useFFList (): { featureList?: string[], betaList?: string[],
  alphaList?: string[] } {
  const params = useParams()
  const jwtPayload = getJwtTokenPayload()
  const { data } = useGetBetaStatusQuery({ params })
  const betaEnabled = (data?.enabled === 'true')? true : false

  // only if it's delgation flow and FF true then call -
  const isDelegationTierApi = useIsSplitOn(Features.DELEGATION_TIERING) && isDelegationMode()
  const accTierResponse = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
  const acxAccountTier = accTierResponse?.data?.acx_account_tier?? jwtPayload?.acx_account_tier
  const { data: userProfile } = useUserProfileContext()

  const tenantType = (jwtPayload?.tenantType === AccountType.REC ||
    jwtPayload?.tenantType === AccountType.VAR)? AccountType.REC 
    : AccountType.MSP 
  
  // Only 3 verticals Default, Education & Hospitality will be supported in split.io
  // rest all types will be derived as 'Default' vertical type
  // Use case scenarios ----
  // AccountType AccountVertical                                     SPLIT FF Key
  // REC         Unknown, Default, Non Profit, Government            Feature-REC-Default
  // REC         Education                                           Feature-REC-Education
  // REC         Hospitality                                         Feature-REC-Hospitality
  // MSP         Unknown, Default,Non Profit,Governemnt,Education    Feature-MSP-Default
  // MSP         Hospitality                                         Feature-MSP-Hospitality
  //
  const isDefaultList = () => {
    return jwtPayload?.acx_account_vertical === AccountVertical.DEFAULT ||
    jwtPayload?.acx_account_vertical === AccountVertical.GOVERNMENT ||
    jwtPayload?.acx_account_vertical === AccountVertical.UNKNOWN ||
    jwtPayload?.acx_account_vertical === AccountVertical.NONPROFIT
  }
  jwtPayload.acx_account_vertical = AccountVertical.HOSPITALITY
  const accountVerticalRec = (isDefaultList() && tenantType !== AccountType.REC )?
    AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
  const accountVerticalMsp =  ((isDefaultList() || jwtPayload?.acx_account_vertical
    === AccountVertical.HOSPITALITY) && tenantType === AccountType.MSP) ?
      AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical
  const accountVertical = tenantType === AccountType.REC? accountVerticalRec : accountVerticalMsp

  useDebugValue(`JWT tenantType: ${jwtPayload?.tenantType}, Tenant type: ${tenantType}`)
  const treatment = useTreatments([Features.PLM_FF], {
    tier: acxAccountTier,
    vertical: accountVertical,
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
    accountVertical
  ].join('-') as keyof typeof defaultConfig

  return {
    featureList: userFFConfig[featureKey],
    betaList: betaEnabled? userFFConfig['betaList'] : [],
    alphaList: (betaEnabled && userProfile?.dogfood) ? userFFConfig['alphaList'] : []
  }
}

export function useIsTierAllowed (featureId: string): boolean {
  const {
    featureList = [],
    betaList = [],
    alphaList = []
  } = useFFList()
  const enabled =
  featureList?.includes(featureId) || betaList.includes(featureId) || alphaList.includes(featureId)
  // eslint-disable-next-line max-len
  useDebugValue(`PLM CONFIG: featureList: ${featureList}, betaList: ${betaList}, alphaList: ${alphaList}, ${featureId}: ${enabled}`)
  return enabled
}
