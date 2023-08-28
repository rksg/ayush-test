import jwtDecode from 'jwt-decode'

import { isDelegationMode } from './apiService'
import { getTenantId }      from './getTenantId'

export enum AccountTier {
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

export enum AccountVertical {
  DEFAULT = 'Default',
  HOSPITALITY = 'Hospitality',
  EDU = 'Education',
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
  MSP_NON_VAR = 'MSP_NON_VAR',
  MSP_INTEGRATOR = 'MSP_INTEGRATOR',
  MSP_INSTALLER = 'MSP_INSTALLER'
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

  try {
    const token = jwtDecode(jwt) as JwtToken

    cache.clear()
    cache.set(jwt, token)
    return token
  } catch {
    throw new Error('Unable to parse JWT Token')
  }
}

export function getJwtHeaders ({ ignoreDelegation = false }: { ignoreDelegation?: boolean } = {}) {
  return {
    ...(getJwtToken() && { Authorization: `Bearer ${getJwtToken()}` }),
    ...(!ignoreDelegation && isDelegationMode() && { 'x-rks-tenantid': getTenantId() })
  }
}

export async function loadImageWithJWT (imageId: string) {
  const headers = { mode: 'no-cors', ...getJwtHeaders() }
  const url = `/api/file/tenant/${getTenantId()}/${imageId}/url`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`)
  } else {
    const result = await response.json()
    return result.signedUrl
  }
}
