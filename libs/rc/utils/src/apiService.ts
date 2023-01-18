import { generatePath, Params } from 'react-router-dom'

export interface ApiInfo {
  url: string;
  method: string;
}

export const TenantIdFromJwt = () => {
  const jwtToken = getJwtTokenPayload()
  const tenanetIdFromJwt = getTenanetIdFromJwt(jwtToken as string)

  return tenanetIdFromJwt
}

export const isDelegationMode = () => {
  const jwtToken = getJwtTokenPayload()

  return (getTenanetIdFromJwt(jwtToken as string) !== getTenantId())
}

export const getJwtTokenPayload = () => {
  if (sessionStorage.getItem('jwt')) {
    return sessionStorage.getItem('jwt') as String
  } else {
    // eslint-disable-next-line no-console
    console.warn('JWT TOKEN NOT FOUND!!!!!')
    return null
  }
}

const getTenanetIdFromJwt = (jwt: string) => {
  if (jwt) {
    let tokens = jwt.split('.')

    if (tokens.length >= 2) {
      const jwtRuckus = JSON.parse(atob(tokens[1]))
      if (jwtRuckus && jwtRuckus.tenantId) {
        return jwtRuckus.tenantId
      }
    }
  }
  return getTenantId()
}

export const createHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreHeader?: boolean
) => {
  let defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  const tokenHeader = {
    Authorization: ''
  }
  const jwtToken = getJwtTokenPayload()
  const tenantId = getTenantId()
  if (jwtToken !== null) {
    const tenanetIdFromJwt = getTenanetIdFromJwt(jwtToken as string)
    const extraHeader = {
      'x-rks-tenantid': tenantId
    }
    tokenHeader.Authorization = `Bearer ${jwtToken}`
    defaultHeaders = (ignoreHeader || tenanetIdFromJwt === tenantId)
      ? { ...tokenHeader, ...defaultHeaders }
      : { ...tokenHeader, ...defaultHeaders, ...extraHeader }
  }
  const headers = { ...defaultHeaders, ...customHeaders }
  const url = generatePath(`${apiInfo.url}`, paramValues)
  return {
    headers,
    method: apiInfo.method,
    url: `${window.location.origin}${url}`
  }
}

export interface Filters {
  venueId?: string[];
  networkId?: string[];
  switchId?: string[];
  clientId?: string[];
  serialNumber?: string[];
}

export const getFilters = (params: Params) => {
  let filters: Filters = {}

  if (params.networkId) {
    filters.networkId = [params.networkId]
  }
  if (params.venueId) {
    filters.venueId = [params.venueId]
  }

  return filters
}

function getTenantId () {
  const chunks = window.location.pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}
