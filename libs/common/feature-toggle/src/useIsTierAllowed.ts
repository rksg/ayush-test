import { useDebugValue, useMemo } from 'react'

import { useTreatments } from '@splitsoftware/splitio-react'
import _                 from 'lodash'

import { useUserProfileContext }                            from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload } from '@acx-ui/utils'

import { Features, TierFeatures } from './features'
import { useIsAlphaEnabled }      from './useIsAlphaEnabled'
import { useIsBetaEnabled }       from './useIsBetaEnabled'
type TierKey = `feature-${AccountType}-${AccountVertical}` | 'betaList' | 'alphaList'

/* eslint-disable max-len, key-spacing */
export const defaultConfig: Partial<Record<TierKey, string[]>> = {
  'feature-REC-Default'     : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY-ESNTLS', 'API-CLOUD', 'BETA-CP','ADMN-SSO','AP-CCD','AP-NEIGHBORS', 'BETA-CLB', 'BETA-MESH','BETA-ZD2R1' ],
  'feature-REC-Education'   : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY-ESNTLS', 'API-CLOUD', 'BETA-CP','ADMN-SSO', 'BETA-CLB'],
  'feature-MSP-Default'     : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY-ESNTLS', 'PLCY-SGMNT', 'API-CLOUD', 'BETA-CP','ADMN-SSO','AP-CCD','AP-NEIGHBORS', 'BETA-CLB', 'BETA-MESH','BETA-ZD2R1'],
  'feature-MSP-Hospitality' : ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS', 'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY-ESNTLS', 'PLCY-SGMNT', 'API-CLOUD', 'BETA-CP','ADMN-SSO', 'BETA-CLB'],
  'betaList'                : ['PLCY-EDGE','AP-70','BETA-DPSK3']
}
/* eslint-enable */

export function useFFList (): {
  featureList?: string[],
  betaList?: string[],
  featureDrawerBetaList?: string[],
  alphaList?: string[] } {
  const { accountTier, betaEnabled } = useUserProfileContext()
  const jwtPayload = getJwtTokenPayload()
  const acxAccountTier = accountTier?? jwtPayload?.acx_account_tier

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
    return treatment?.config ? JSON.parse(String(treatment.config)) : {}
  }, [treatment])

  const featureKey = [
    'feature',
    tenantType,
    accountVertical
  ].join('-') as keyof typeof defaultConfig

  const featureDefaultKey = [
    'feature',
    tenantType,
    'Default'
  ].join('-') as keyof typeof defaultConfig

  return {
    featureList: (accountVertical === AccountVertical.DEFAULT)?
      userFFConfig[featureKey] : _.union(userFFConfig[featureKey], userFFConfig[featureDefaultKey]),
    betaList: betaEnabled? userFFConfig['betaList'] : [],
    featureDrawerBetaList: userFFConfig['betaList'],
    alphaList: useIsAlphaEnabled() ? userFFConfig['alphaList'] : []
  }
}

export function useIsTierAllowed (featureId: string): boolean {
  const { selectedBetaListEnabled } = useUserProfileContext()
  const {
    featureList = [],
    betaList = [],
    alphaList = []
  } = useFFList()
  const isBetaFeatureEnable = useIsBetaEnabled(featureId as TierFeatures)
  const betaFeatureEnabled =
    selectedBetaListEnabled ? isBetaFeatureEnable : betaList.includes(featureId)
  const enabled =
    featureList?.includes(featureId) || betaFeatureEnabled
    || alphaList.includes(featureId)
  useDebugValue(`PLM CONFIG: featureList: ${featureList}, betaList: ${betaList},
  alphaList: ${alphaList}, ${featureId}: ${enabled}`)
  return enabled
}

export const useGetBetaList = (): string[] => {
  return useFFList().featureDrawerBetaList?? []
}
