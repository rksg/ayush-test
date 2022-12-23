import { generatePath, Params } from 'react-router-dom'

export interface ApiInfo {
  url: string;
  method: string;
}

const getJwtTokenPayload = () => {
  if (sessionStorage.getItem('jwt')) {
    return sessionStorage.getItem('jwt')
  } else {
    // eslint-disable-next-line no-console
    console.warn('JWT TOKEN NOT FOUND!!!!!')
    return null
  }
}

let defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-rks-tenantid': getTenantId()
}

export const createHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>
) => {
  const tokenHeader = {
    Authorization: ''
  }
  defaultHeaders['x-rks-tenantid'] = getTenantId()
  if (getJwtTokenPayload() !== null) {
    tokenHeader.Authorization = `Bearer ${getJwtTokenPayload()}`
    defaultHeaders = { ...tokenHeader, ...defaultHeaders }
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

  return filters
}

function getTenantId () {
  const chunks = window.location.pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}
