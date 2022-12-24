import { generatePath, Params } from 'react-router-dom'

export interface ApiInfo {
  url: string;
  method: string;
}

export const isDelegationMode = () => {
  const jwtToken = getJwtTokenPayload()

  return (getTenanetIdFromJwt(jwtToken as string) !== getTenantId())
}

const getJwtTokenPayload = () => {
  // const jwt = 'eyJraWQiOiIxNjY5ODUyODAwNzAwMjU1NzQ0IiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzd3VJZCI6IjAwMzJoMDAwMDBMVXFhQkFBVCIsInRlbmFudFR5cGUiOiJSVUNLVVNfU1VQUE9SVF9VU0VSIiwic3ViIjoiZDdmYmE1NGNiMGUxNGM2Y2FlNDhiOTBiYWY3ZTYzMWMiLCJsYXN0TmFtZSI6Ikxhc3ROYW1lIDE0MDYiLCJjb21wYW55TmFtZSI6IkRvZyBDb21wYW55IDE0MDYiLCJwdmVyIjoiYWN4LWh5YnJpZCIsImlzcyI6ImF1dGgtc2VydmljZSIsImFjeF9hY2NvdW50X2FjdGl2YXRpb25fZmxhZyI6ZmFsc2UsInVzZXJJZG1UZW5hbnRJZCI6IjAwMTJoMDAwMDBOcmxPbkFBSiIsIm1saXNhVXNlclJvbGUiOiJhbHRvLWZ1bGwtYW5hbHl0aWNzIiwiYWN4X2FjY291bnRfYWN0aXZhdGlvbl9kYXRlIjoiMjAyMi0xMi0yMyIsImFjeF9hY2NvdW50X3R5cGUiOiJSRUMiLCJzY29wZSI6ImxvZ2luIiwiaXNNb2JpbGVBcHBVc2VyIjpmYWxzZSwiZXhwIjoxNjcxODI4NDQ5LCJpYXQiOjE2NzE4MjQ4NDksImVtYWlsIjoiZG9nMTQwNkBlbWFpbC5jb20iLCJpc1ZhciI6ZmFsc2UsImFjeF9hY2NvdW50X3ZlcnRpY2FsIjoiRGVmYXVsdCIsImlzQXV0aE9ubHlVc2VyIjpmYWxzZSwiaXNSdWNrdXNVc2VyIjpmYWxzZSwidXNlck5hbWUiOiJkb2cxNDA2QGVtYWlsLmNvbSIsInZhcklkbVRlbmFudElkIjoiMDAxMmgwMDAwME5ybE9uQUFKIiwiZmlyc3ROYW1lIjoiRmlzcnROYW1lIDE0MDYiLCJ2YXJBbHRvVGVuYW50SWQiOiJkN2ZiYTU0Y2IwZTE0YzZjYWU0OGI5MGJhZjdlNjMxYyIsImZsZXhlcmFfYWxtX2FjY291bnRfaWQiOiIiLCJ0ZW5hbnRJZCI6ImQ3ZmJhNTRjYjBlMTRjNmNhZTQ4YjkwYmFmN2U2MzFjIiwicm9sZU5hbWUiOlsiU1VQUE9SVCIsIkRFVk9QUyIsIlBSSU1FX0FETUlOIl0sImlzUnVja3VzU3VwcG9ydCI6dHJ1ZSwib3JpZ2luYWxSZXF1ZXN0ZWRVUkwiOiJodHRwczovL2RldmFsdG8ucnVja3Vzd2lyZWxlc3MuY29tLyIsInJlbmV3IjoxNjcxODI4MDg5LCJyZWdpb24iOiJbTkEsIEVVLCBBU0lBXSIsImFjeF9hY2NvdW50X3JlZ2lvbnMiOlsiRVUiLCJBUyIsIk5BIl0sImFjeF9hY2NvdW50X3RpZXIiOiJHb2xkIiwiYWN4X3RyaWFsX2luX3Byb2dyZXNzIjpmYWxzZX0.XVw-LEy1H1y9OZQYM_G_RGRZjne4svuhLsh3PErHFvBbiednr0ou7ZTZHve-Cs0ElQROMCTo4M8eUhWBGpi-3vzTpxX9o82ei6nDqXZYmTVPgYuOD1vzDThfEDuiDybApgrvBIKO-06bDUW3PC6eUf3aW8aZwZLAnWCE66_o0n_DSYWOsm0qCq08JBrxqh4veYFtyPADQSYn-7jJR3YWGfN4ud6TOan5GkGtinzhicyBCw_VBQJqGTIeAC-xnveQGdqvuhXDDd6MtN7Fd_l8Xr26VGxBZu6Tzb7jadh95pIwvsZOoI1Qxc11iEHryq1TmJz4y_m7tP6aVaLw0R43XQ'
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

  return filters
}

function getTenantId () {
  const chunks = window.location.pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}
