import { TenantIdFromJwt } from './apiService'
import { getTenantId } from './getTenantId'

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

interface JwtToken {
  swuId?: string
  tenantType?: AccountType
  sub?: string
  lastName: string
  companyName: string
  pver?: string
  iss?: string
  userIdmTenantId?: string
  mlisaUserRole?: string
  scope?: string
  adminId?: string
  exp: number
  iat?: number
  email: string
  isVar?: boolean
  isRuckusUser?: boolean
  userName: string
  varIdmTenantId?: string
  firstName: string
  varAltoTenantId?: string
  flexera_alm_account_id?: string
  tenantId: string
  roleName?: string[]
  isRuckusSupport?: boolean
  renew?: number
  region?: string
  acx_account_regions?: AccountRegion[]
  acx_account_tier?: AccountTier
  acx_account_vertical?: AccountVertical
  acx_trial_in_progress?: boolean
  isBetaFlag?: boolean
}

const cache = new Map<string, JwtToken>()

// Fetch JWT token payload data
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
    const token = JSON.parse(window.atob(jwt.split('.')[1])) as JwtToken
    cache.clear()
    cache.set(jwt, token)
    return token
  } catch {
    throw new Error('Unable to parse JWT Token')
  }
}

export function getJwtToken () {
  if (sessionStorage.getItem('jwt')) {
    return sessionStorage.getItem('jwt')
  }
  return null
}

export async function loadImageWithJWT (imageId: string) {
  let gImgUrl = ''
  const headers = {
    mode: 'no-cors',
    ...(getJwtToken() ? { Authorization: `Bearer ${getJwtToken()}` } : {}),
    ...((getTenantId() !== TenantIdFromJwt()) ? { 'x-rks-tenantid': getTenantId() } : {})
  }
  const url = `/files/${imageId}/urls`
  const result = await fetch(url, { headers }).then(function (response) {
    return response.json()
  })
  if (result) {
    gImgUrl = result.signedUrl
  } else {
    throw new Error(`Error! status: ${result.status}`)
  }
  return gImgUrl
}
