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
  MSP_INSTALLER = ' MSP_INSTALLER'
}

interface JwtToken {
  acx_account_activation_date: string
  acx_account_activation_flag: boolean
  acx_account_regions: AccountRegion[]
  acx_account_tier: AccountTier
  acx_account_type: AccountType
  acx_account_vertical: AccountVertical
  acx_trial_in_progress: boolean
  companyName: string
  email: string
  exp: number
  firstName: string
  flexera_alm_account_id: string
  iat: number
  isAuthOnlyUser: boolean
  isMobileAppUser: boolean
  isRuckusSupport: boolean
  isRuckusUser: boolean
  iss: string
  isVar: boolean
  lastName: string
  mlisaUserRole: string,
  originalRequestedURL: string
  pver: string
  region: string
  renew: number
  roleName: string[]
  scope: string
  sub: string,
  swuId: string
  tenantId: string
  tenantType: AccountType
  userIdmTenantId: string
  userName: string
  varAltoTenantId: string
  varIdmTenantId: string
}

const cache = new Map()

const isDev = process.env['NODE_ENV'] === 'development'

// Fetch JWT token payload data
export function getJwtTokenPayload () {
  const jwt = getJwtToken()

  if (jwt === null) {
    const tenantId = getTenantId()
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('No JWT token found! So setting default JWT values')
    }
    const jwtToken: {
      acx_account_tier: AccountTier;
      acx_account_vertical: AccountVertical;
      acx_account_type: AccountType;
      tenantId: string | undefined } = {
        acx_account_tier: AccountTier.GOLD,
        acx_account_vertical: AccountVertical.DEFAULT,
        acx_account_type: AccountType.REC,
        tenantId: tenantId
      }
    return jwtToken
  }

  if (cache.has(jwt)) return cache.get(jwt)

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
  } else {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('JWT TOKEN NOT FOUND!!!!!')
    }
    return null
  }
}
