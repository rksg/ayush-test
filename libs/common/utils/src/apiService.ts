import _                        from 'lodash'
import { generatePath, Params } from 'react-router-dom'

import { getTenantId }              from './getTenantId'
import { getJwtToken, AccountTier } from './jwtToken'

export interface ApiInfo {
  url: string;
  method: string;
  newApi?: boolean;
  oldUrl?: string;
}

export const TenantIdFromJwt = () => {
  const jwtToken = getJwtToken()
  const tenantIdFromJwt = getTenantIdFromJwt(jwtToken as string)

  return tenantIdFromJwt
}

export const isDelegationMode = () => {
  const jwtToken = getJwtToken()

  return (getTenantIdFromJwt(jwtToken as string) !== getTenantId())
}

export const JwtTierValue = () => {
  const jwtToken = getJwtToken()

  if (jwtToken) {
    const tokens = jwtToken.split('.')

    if (tokens.length >= 2) {
      const jwtRuckus = JSON.parse(atob(tokens[1]))
      if (jwtRuckus && jwtRuckus.acx_account_tier) {
        return jwtRuckus.acx_account_tier
      }
    }
  }
  return AccountTier.PLATINUM
}

export const isLocalHost = () => {
  return window.location.hostname === 'localhost'
}

export const isDev = () => {
  return window.location.hostname === 'devalto.ruckuswireless.com'
}

export const isQA = () => {
  return window.location.hostname === 'qaalto.ruckuswireless.com'
}

export const isIntEnv = () => {
  return window.location.hostname === 'intalto.ruckuswireless.com'
}

const getTenantIdFromJwt = (jwt: string) => {
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

  const jwtToken = getJwtToken()
  const tenantId = getTenantId()
  if (jwtToken !== null) {
    const tenantIdFromJwt = getTenantIdFromJwt(jwtToken as string)
    const extraHeader = {
      'x-rks-tenantid': tenantId
    }
    tokenHeader.Authorization = `Bearer ${jwtToken}`
    defaultHeaders = (ignoreHeader || tenantIdFromJwt === tenantId)
      ? { ...tokenHeader, ...defaultHeaders }
      : { ...tokenHeader, ...defaultHeaders, ...extraHeader }
  }
  const headers = { ...defaultHeaders, ...customHeaders }
  const domain = (enableNewApi(apiInfo) && !isLocalHost()) ?
    window.location.origin.replace('//', '//api.') :
    window.location.origin
  const url = enableNewApi(apiInfo) ? generatePath(`${apiInfo.url}`, paramValues) :
    generatePath(`${apiInfo.oldUrl || apiInfo.url}`, paramValues)
  return {
    headers,
    credentials: 'include' as RequestCredentials,
    method: apiInfo.method,
    url: `${domain}${url}`
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

export const enableNewApi = function (apiInfo: ApiInfo) {
  const hasOldUrl = !_.isEmpty(apiInfo?.oldUrl)
  if(apiInfo.newApi) {
    return !hasOldUrl || isDev() || isQA() || isLocalHost() || isIntEnv()
  } else {
    return false
  }
}

export const getUrlForTest = (apiInfo: ApiInfo) => {
  return enableNewApi(apiInfo) ? apiInfo.url : (apiInfo.oldUrl || apiInfo.url)
}
