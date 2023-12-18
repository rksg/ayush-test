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
  'feature-REC-Default'     : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY-ESNTLS', 'API-CLOUD', 'BETA-CP','ADMN-SSO','AP-CCD','AP-NEIGHBORS', 'BETA-CLB', 'BETA-MESH','BETA-ZD2R1' ],
  'feature-REC-Education'   : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY-ESNTLS', 'API-CLOUD', 'BETA-CP','ADMN-SSO', 'BETA-CLB'],
  'feature-MSP-Default'     : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY-ESNTLS', 'PLCY-SGMNT', 'API-CLOUD', 'BETA-CP','ADMN-SSO','AP-CCD','AP-NEIGHBORS', 'BETA-CLB', 'BETA-MESH','BETA-ZD2R1'],
  'feature-MSP-Hospitality' : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY-ESNTLS', 'PLCY-SGMNT', 'API-CLOUD', 'BETA-CP','ADMN-SSO', 'BETA-CLB'],
  'betaList'                : ['PLCY-EDGE','AP-70','BETA-DPSK3']
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
  // Use case scenarios:
  // AccountType AccountVertical                                     SPLIT PLM FF Key
  // ----------- ---------------                                     ----------------
  // REC         Unknown,Default,Non Profit,Government               feature-REC-Default
  // REC         Education                                           feature-REC-Education
  // REC         Hospitality                                         feature-REC-Hospitality
  // MSP         Unknown, Default,Non Profit,Governemnt,Education    feature-MSP-Default
  // MSP         Hospitality                                         feature-MSP-Hospitality

  const recDefaultVerticals = [AccountVertical.DEFAULT, AccountVertical.GOVERNMENT,
    AccountVertical.UNKNOWN, AccountVertical.NONPROFIT]
  const mspDefaultVerticals = [...recDefaultVerticals, AccountVertical.EDU]
  const defaultVerticals = tenantType === AccountType.REC ? recDefaultVerticals
    : mspDefaultVerticals
  const accountVertical = defaultVerticals.includes(
    jwtPayload?.acx_account_vertical as AccountVertical)
    ? AccountVertical.DEFAULT : jwtPayload?.acx_account_vertical

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
