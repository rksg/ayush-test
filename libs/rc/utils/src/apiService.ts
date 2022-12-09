import { useEffect } from 'react'

import { generatePath, Params } from 'react-router-dom'

export interface ApiInfo {
  url: string;
  method: string;
}
// TODO: BE dependency ACX-17955 for UI ACX-18598, ACX-18541, ACX-18659
const Jwt = () => {
  const jwt = sessionStorage.getItem('jwt')
  // useEffect(() => {
  //   fetch('Some_API').then(response => {
  //     // eslint-disable-next-line no-console
  //     console.log(response.headers)
  //   })
  // }, [])
  // eslint-disable-next-line no-console
  if (!jwt) return console.log('NO JWT TOKEN FOUND!!!!!')
  return jwt
}

// eslint-disable-next-line no-console
console.log(Jwt())

// eslint-disable-next-line max-len
const jwtToken = 'eyJraWQiOiIxNjY3MjYwODAwMjUwNjk1OTM2IiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzd3VJZCI6IjAwMzJoMDAwMDBMVXFidUFBRCIsInRlbmFudFR5cGUiOiJSRUMiLCJzdWIiOiIxM2RkMDZmMjY2YTQ0MGZmODFjMmFhOWVhYzA0Y2EwOSIsImxhc3ROYW1lIjoiTGFzdE5hbWUgMTUwMiIsImNvbXBhbnlOYW1lIjoiRG9nIENvbXBhbnkgMTUwMiIsInB2ZXIiOiJhY3gtaHlicmlkIiwiaXNzIjoiYXV0aC1zZXJ2aWNlIiwiYWN4X2FjY291bnRfYWN0aXZhdGlvbl9mbGFnIjp0cnVlLCJ1c2VySWRtVGVuYW50SWQiOiIwMDEyaDAwMDAwTnJsUVdBQVoiLCJtbGlzYVVzZXJSb2xlIjoiYWx0by1mdWxsLWFuYWx5dGljcyIsImFjeF9hY2NvdW50X2FjdGl2YXRpb25fZGF0ZSI6IjIwMjItMTEtMjkiLCJhY3hfYWNjb3VudF90eXBlIjoiUkVDIiwic2NvcGUiOiJsb2dpbiIsImlzTW9iaWxlQXBwVXNlciI6ZmFsc2UsImV4cCI6MTY2OTY4NjM5MiwiaWF0IjoxNjY5NjgyNzkyLCJlbWFpbCI6ImRvZzE1MDJAZW1haWwuY29tIiwiaXNWYXIiOmZhbHNlLCJhY3hfYWNjb3VudF92ZXJ0aWNhbCI6IkRlZmF1bHQiLCJpc0F1dGhPbmx5VXNlciI6dHJ1ZSwiaXNSdWNrdXNVc2VyIjpmYWxzZSwidXNlck5hbWUiOiJkb2cxNTAyQGVtYWlsLmNvbSIsInZhcklkbVRlbmFudElkIjoiMDAxMmgwMDAwME5ybFFXQUFaIiwiZmlyc3ROYW1lIjoiRmlzcnROYW1lIDE1MDIiLCJ2YXJBbHRvVGVuYW50SWQiOiIxM2RkMDZmMjY2YTQ0MGZmODFjMmFhOWVhYzA0Y2EwOSIsImZsZXhlcmFfYWxtX2FjY291bnRfaWQiOiIiLCJ0ZW5hbnRJZCI6IjEzZGQwNmYyNjZhNDQwZmY4MWMyYWE5ZWFjMDRjYTA5Iiwicm9sZU5hbWUiOlsiUFJJTUVfQURNSU4iXSwiaXNSdWNrdXNTdXBwb3J0IjpmYWxzZSwib3JpZ2luYWxSZXF1ZXN0ZWRVUkwiOiJodHRwczovL2ludGFsdG8ucnVja3Vzd2lyZWxlc3MuY29tL2F1dGhvbmx5IiwicmVuZXciOjE2Njk2ODYwMzIsInJlZ2lvbiI6IltOQV0iLCJhY3hfYWNjb3VudF9yZWdpb25zIjpbIkVVIiwiQVMiLCJOQSJdLCJhY3hfYWNjb3VudF90aWVyIjoiR29sZCIsImFjeF90cmlhbF9pbl9wcm9ncmVzcyI6dHJ1ZX0.GmWRlHwqK8kCys0vsNEnd8uf7fD_MNGEetIIwnkwcKf2iSRdam75Y3Tb3srPLM1ZqOU3SCmh5IAhLokFqIIbhD24GvXvHv1gWLhZ4tCfkTa8QC8BliksHwhrG8PYG7AymTzph2TworVkDALC8TpDQi6oTGJwKOEGS-8adONhgoJPoSxS8F7WaygTxeBui5xc0JbRaGvsuPYWK7DfkfGUAxx23pe9V4NKgxYcTePERiyZvdX2BkcRQevNqZ4kPKWJV7lcoRmzh8KaijeYWalbNb1h_MujnrvRGhtA9KPk4TuuCCd8iH0V-dMRfVGzfNHV35Zr8H1XMh0tsYqlB9FL3Q'
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${jwtToken}`
}

export const createHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>
) => {
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
