import _                        from 'lodash'
import { generatePath, Params } from 'react-router-dom'

import { get } from '@acx-ui/config'

import { getTenantId }              from './getTenantId'
import { getJwtToken, AccountTier } from './jwtToken'

export interface ApiInfo {
  url: string;
  method: string;
  newApi?: boolean;
  oldUrl?: string;
  oldMethod?: string;
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
  return window.location.hostname.includes('devalto.ruckuswireless.com')
}

export const isQA = () => {
  return window.location.hostname.includes('qaalto.ruckuswireless.com')
}

export const isScale = () => {
  return window.location.hostname.includes('scalealto.ruckuswireless.com')
}

export const isIntEnv = () => {
  return window.location.hostname.includes('intalto.ruckuswireless.com')
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
  const newApiHostName = window.location.origin.replace(
    window.location.hostname, get('NEW_API_DOMAIN_NAME'))
  const domain = (enableNewApi(apiInfo) && !isLocalHost()) ?
    newApiHostName : window.location.origin
  const url = enableNewApi(apiInfo) ? generatePath(`${apiInfo.url}`, paramValues) :
    generatePath(`${apiInfo.oldUrl || apiInfo.url}`, paramValues)
  const method = enableNewApi(apiInfo) ? apiInfo.method : (apiInfo.oldMethod || apiInfo.method)
  return {
    headers,
    credentials: 'include' as RequestCredentials,
    method: method,
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
    return !hasOldUrl || isDev() || isQA() || isScale() || isLocalHost() || isIntEnv()
  } else {
    return false
  }
}

export const getUrlForTest = (apiInfo: ApiInfo) => {
  return enableNewApi(apiInfo) ? apiInfo.url : (apiInfo.oldUrl || apiInfo.url)
}
