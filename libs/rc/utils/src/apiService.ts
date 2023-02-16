import { generatePath, Params } from 'react-router-dom'

import { getJwtToken, getTenantId } from '@acx-ui/utils'

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
  const url = generatePath(`${apiInfo.url}`, paramValues)
  const isLocalHost = window.location.hostname === 'localhost'
  const newSubdomain = window.location.origin.replace('//', '//api.')
  return {
    headers,
    method: apiInfo.method,
    url: apiInfo.newApi && !isLocalHost ? `${newSubdomain}${url}` :
      `${window.location.origin}${url}`
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
