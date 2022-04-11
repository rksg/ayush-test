import { getTenantId } from './user.profile.service'

export interface ApiInfo {
  url: string;
  method: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

const defaultParamValues = {
  tenantId: getTenantId()
}

export const createHttpRequest = (apiInfo: ApiInfo, paramValues?: {}, customHeaders?: {}) => {
  const headers = { ...defaultHeaders, ...customHeaders }
  const method = apiInfo.method
  const urlParams = { ...defaultParamValues, ...paramValues }
  const url = replaceParams(apiInfo.url, urlParams)
  return {
    headers,
    method,
    url
  }
}

const replaceParams = (url: string, valuesObj?: any): string => {
  if (valuesObj) {
    url = url.replace(
      /{([\s\S]+?)}/g,
      function (m, key){
        return valuesObj.hasOwnProperty(key) ? valuesObj[key] : ''
      }
    )
  }
  return url
}
