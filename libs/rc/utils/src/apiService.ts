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
  return {
    headers,
    method: apiInfo.method,
    url: `${window.location.origin}${url}`
  }
}
