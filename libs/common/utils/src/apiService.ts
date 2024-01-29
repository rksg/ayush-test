import { QueryReturnValue }                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                       from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { generatePath, Params }                               from 'react-router-dom'

import { get }            from '@acx-ui/config'
import { RequestPayload } from '@acx-ui/types'

import { getTenantId }                       from './getTenantId'
import { getJwtTokenPayload, getJwtHeaders } from './jwtToken'

export interface ApiInfo {
  url: string;
  method: string;
  newApi?: boolean;
  useDefaultHostname?: boolean,
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

export const ignoreErrorModal = {
  'Build-In-Error-Modal': 'ignore'
}
export const showApiError = {
  'Build-In-Error-Modal': 'showApiError'
}

export const isIgnoreErrorModal = (request?: Request) => {
  return request?.headers ? request.headers.get('Build-In-Error-Modal') === 'ignore' : false
}

export const isShowApiError = (request?: Request) => {
  return request?.headers ? request.headers.get('Build-In-Error-Modal') === 'showApiError' : false
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
  const domain = (!isLocalHost() && !apiInfo.useDefaultHostname) ? newApiHostName : origin
  const tmpParamValues = {
    ...paramValues
  }
  if(paramValues && paramValues.hasOwnProperty('tenantId') && !paramValues.tenantId){
    tmpParamValues.tenantId = ''
  }
  const url = generatePath(`${apiInfo.url}`, tmpParamValues)
  const method = apiInfo.method
  return {
    headers,
    credentials: 'include' as RequestCredentials,
    method: method,
    url: `${domain}${url}`
  }
}

export const batchApi = (apiInfo: ApiInfo, requests: RequestPayload<unknown>[],
  fetchWithBQ:(arg: string | FetchArgs) => MaybePromise<
  QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>) => {
  const promises = requests.map((arg) => {
    const req = createHttpRequest(apiInfo, arg.params)
    return fetchWithBQ({
      ...req,
      body: arg.payload
    })
  })
  return Promise.all(promises)
    .then((results) => {
      return { data: results }
    })
    .catch((error)=>{
      return error
    })
}

export interface Filters {
  venueId?: string[];
  networkId?: string[];
  switchId?: string[];
  clientId?: string[];
  serialNumber?: string[];
  deviceGroupId?: string[];
}

export const getFilters = (params: Params) => {
  let filters: Filters = {}

  if (params.networkId) {
    filters.networkId = [params.networkId]
  }
  if (params.venueId) {
    filters.venueId = [params.venueId]
  }
  if (params.apGroupId) {
    filters.deviceGroupId = [params.apGroupId]
  }

  return filters
}
