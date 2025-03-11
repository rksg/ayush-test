import jwtDecode from 'jwt-decode'

import { get } from '@acx-ui/config'

import { isDelegationMode, isLocalHost } from './apiService'
import { getTenantId }                   from './getTenantId'

export enum AccountTier {
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

export enum AccountVertical {
  DEFAULT = 'Default',
  EDU = 'Education',
  GOVERNMENT = 'Government',
  HOSPITALITY = 'Hospitality',
  NONPROFIT = 'Non Profit',
  UNKNOWN = 'Unknown'
}

export enum AccountRegion {
  NA = 'NA',
  EU = 'EU',
  ASIA = 'AS'
}

export enum AccountType {
  REC = 'REC',
  MSP = 'MSP',
  VAR = 'VAR',
  MSP_EC = 'MSP_EC',
  MSP_REC = 'MSP_REC',
  MSP_NON_VAR = 'MSP_NON_VAR',
  MSP_INTEGRATOR = 'MSP_INTEGRATOR',
  MSP_INSTALLER = 'MSP_INSTALLER',
  RUCKUS_DEV = 'RUCKUS_DEV',
}

export enum PverName {
  ACX = 'acx',
  ACX_HYBRID = 'acx-hybrid',
  R1 = 'ruckus-one'
}

interface JwtToken {
  swuId?: string
  tenantType?: AccountType
  sub?: string
  lastName: string
  pver?: string
  iss?: string
  mlisaUserRole?: string
  scope?: string
  adminId?: string
  exp: number
  iat?: number
  isVar?: boolean
  userName: string
  firstName: string
  flexera_alm_account_id?: string
  tenantId: string
  roleName?: string[]
  isRuckusSupport?: boolean
  renew?: number
  region?: string
  acx_account_tier?: AccountTier
  acx_account_vertical?: AccountVertical
  acx_trial_in_progress?: boolean
  isBetaFlag?: boolean
  isAlphaFlag?: boolean
}

const cache = new Map<string, JwtToken>()

export function getJwtToken () {
  return sessionStorage.getItem('jwt') || null
}

export function getJwtTokenPayload () {
  const jwt = getJwtToken()

  if (jwt === null) {
    const tenantId = getTenantId()
    const jwtToken: {
      acx_account_tier: AccountTier
      acx_account_vertical: AccountVertical
      tenantType: AccountType
      isBetaFlag: false
      tenantId: string | undefined } = {
        acx_account_tier: AccountTier.PLATINUM,
        acx_account_vertical: AccountVertical.DEFAULT,
        tenantType: AccountType.REC,
        isBetaFlag: false,
        tenantId: tenantId
      }
    return jwtToken as JwtToken
  }

  if (cache.has(jwt)) return cache.get(jwt)!

  return updateJwtCache(jwt)
}

export function getJwtHeaders ({ ignoreDelegation = false }: { ignoreDelegation?: boolean } = {}) {
  return {
    ...(getJwtToken() &&
      { Authorization: `Bearer ${getJwtToken()}` }),
    ...(!get('IS_MLISA_SA') && !ignoreDelegation && isDelegationMode() &&
      { 'x-rks-tenantid': getTenantId() })
  }
}

export function updateJwtCache (newJwt: string) {
  try {
    const token = jwtDecode(newJwt) as JwtToken

    cache.clear()
    cache.set(newJwt, token)
    return token
  } catch {
    throw new Error('Unable to parse JWT Token')
  }
}

export async function loadImageWithJWT (imageId: string, requestUrl?: string): Promise<string> {
  const headers = { 'mode': 'no-cors', 'Content-Type': 'application/json',
    'Accept': 'application/json', ...getJwtHeaders() }
  const url = getUrlWithNewDomain(requestUrl) || `/api/file/tenant/${getTenantId()}/${imageId}/url`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`)
  } else {
    const result = await response.json()
    return result.signedUrl
  }
}

export const getImageDownloadUrl = async (isFileUrl:boolean, data: string) => {
  return isFileUrl ? data : await loadImageWithJWT(data)
}

function getUrlWithNewDomain (requestUrl?: string) {
  if (requestUrl) {
    const origin = window.location.origin
    const newApiHostName = origin.replace(
      window.location.hostname, get('NEW_API_DOMAIN_NAME'))
    const domain = !isLocalHost()
      ? newApiHostName
      : origin

    return `${domain}${requestUrl}`
  } else {
    return null
  }
}
