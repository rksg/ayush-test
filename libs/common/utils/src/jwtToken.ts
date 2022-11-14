
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
  MSP = 'MSP'
}

interface JwtToken {
  acx_account_activation_date: string
  acx_account_activation_flag: boolean
  acx_account_regions: AccountRegion[]
  acx_account_tier: string
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
  tenantType: 'MSP' | 'REC'
  userIdmTenantId: string
  userName: string
  varAltoTenantId: string
  varIdmTenantId: string
}

const cache = new Map()

// Fetch JWT token payload data
export function getJwtTokenPayload () {
  const jwt = getCookie('JWT')

  if (jwt === null) {
    // eslint-disable-next-line no-console
    console.error('No JWT token found!')
    return null
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

function getCookie (key: string) {
  if (!document.cookie.includes(`${key}=`)) return null
  const start = document.cookie.indexOf(key)
  const end = document.cookie.indexOf(';', start)

  const valueStart = start + key.length + 1
  return document.cookie.slice(valueStart, end)
}
