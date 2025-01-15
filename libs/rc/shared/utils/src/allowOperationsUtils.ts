
import { ApiInfo } from '@acx-ui/utils'

export const genAllowOperationsPath = (apiInfo: ApiInfo): string => {
  if(apiInfo.opsApi) return apiInfo.opsApi
  const pathParts = apiInfo.url.split('/').map((part) => {
    if (part.startsWith(':')) {
      return '{id}'
    }
    return part
  })
  return `${apiInfo.method.toUpperCase()}:${pathParts.join('/')}`
}