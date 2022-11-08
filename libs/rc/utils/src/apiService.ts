import _                        from 'lodash'
import { generatePath, Params } from 'react-router-dom'
export interface ApiInfo {
  url: string;
  method: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

export const createHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>
) => {
  const headers = { ...defaultHeaders, ...customHeaders }
  const url = generatePath(`${apiInfo.url}`, paramValues)
  let prefix = window.location.origin
  let method = apiInfo.method
  const urls = [
    '/api/viewmodel/:tenantId/aps',
    '/api/venues/:venueId/dhcpconfigserviceprofilesettings',
    '/api/tenant/:tenantId/wifi/dhcpconfigserviceprofiles/:serviceId',
    '/api/tenant/:tenantId/wifi/dhcpconfigserviceprofiles',
    '/api/venues/:venueId/dhcpConfigServiceProfileLeases',
    '/api/tenant/:tenantId/wifi/venues/:venueId/dhcppools/:dhcppoolId',
    '/api/venues/:venueId/activedhcppools'
  ]
  if(_.findIndex(urls,(i)=>{return apiInfo.url===i})!==-1){
    prefix = 'http://localhost:8081'
    method = 'get'
  }
  return {
    headers,
    method: method,
    url: `${prefix}${url}`
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
