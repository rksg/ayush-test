import _                        from 'lodash'
import { generatePath, Params } from 'react-router-dom'

import { get } from '@acx-ui/config'

import { getTenantId }                       from './getTenantId'
import { getJwtTokenPayload, getJwtHeaders } from './jwtToken'

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
  return window.location.hostname.includes('dev.ruckus.cloud')
  || window.location.hostname.includes('devalto.ruckuswireless.com')
}

export const isQA = () => {
  return window.location.hostname.includes('qa.ruckus.cloud')
  || window.location.hostname.includes('qaalto.ruckuswireless.com')
}

export const isScale = () => {
  return window.location.hostname.includes('scale.ruckus.cloud')
  || window.location.hostname.includes('scalealto.ruckuswireless.com')
}

export const isIntEnv = () => {
  return window.location.hostname.includes('int.ruckus.cloud')
  || window.location.hostname.includes('intalto.ruckuswireless.com')
}

export const isStage = () => {
  return window.location.hostname.includes('stage.ruckus.cloud')
  || window.location.hostname.includes('opsalto.ruckuswireless.com')
}

export const isProdEnv = () => {
  //prod: ruckus.cloud, asia.ruckus.cloud, eu.ruckus.cloud
  return window.location.hostname.includes('ruckus.cloud')
}

export const ignoreErrorModal = {
  'Build-In-Error-Modal': 'ignore'
}
export const showApiError = {
  'Build-In-Error-Modal': 'showApiError'
}

export const isIgnoreErrorModal = (request?: Request) => {
  return request && request.headers.get('Build-In-Error-Modal') === 'ignore'
}

export const isShowApiError = (request?: Request) => {
  return request && request.headers.get('Build-In-Error-Modal') === 'showApiError'
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

  const origin = window.location.origin
  const newApiHostName = origin.replace(
    window.location.hostname, get('NEW_API_DOMAIN_NAME'))
  const domain = (enableNewApi(apiInfo) && !isLocalHost())
    ? newApiHostName
    : origin
  const tmpParamValues = {
    ...paramValues
  }
  if(paramValues && paramValues.hasOwnProperty('tenantId') && !paramValues.tenantId){
    tmpParamValues.tenantId = ''
  }
  const url = enableNewApi(apiInfo) ? generatePath(`${apiInfo.url}`, tmpParamValues) :
    generatePath(`${apiInfo.oldUrl || apiInfo.url}`, tmpParamValues)
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
  if (apiInfo.newApi) {
    return !hasOldUrl || isDev() || isQA() || isScale() ||
      isLocalHost() || isIntEnv() || isStage() || isProdEnv()
  } else {
    return false
  }
}

export const getUrlForTest = (apiInfo: ApiInfo) => {
  return enableNewApi(apiInfo) ? apiInfo.url : (apiInfo.oldUrl || apiInfo.url)
}
