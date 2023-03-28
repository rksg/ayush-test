import _                        from 'lodash'
import { generatePath, Params } from 'react-router-dom'

import { getTenantId } from './getTenantId'
import {
  getJwtTokenPayload,
  getJwtHeaders
} from './jwtToken'

export interface ApiInfo {
  url: string;
  method: string;
  newApi?: boolean;
  oldUrl?: string;
  oldMethod?: string;
}

export const isDelegationMode = () => {
  return (getJwtTokenPayload().tenantId !== getTenantId())
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

export const isScale = () => {
  return window.location.hostname === 'scalealto.ruckuswireless.com'
}

export const isIntEnv = () => {
  return window.location.hostname === 'intalto.ruckuswireless.com'
}

export const createHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreDelegation?: boolean
) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders,
    ...getJwtHeaders({ ignoreDelegation })
  }
  const domain = (enableNewApi(apiInfo) && !isLocalHost()) ?
    window.location.origin.replace('//', '//api.') :
    window.location.origin
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
