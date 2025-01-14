import { ApiInfo } from '@acx-ui/utils'

export const genAllowOperationsPath = (apiInfo: ApiInfo): string => {
  const targetUrl = apiInfo.opsApi || apiInfo.url
  const pathParts = targetUrl.split('/').map((part) => {
    if (part.startsWith(':')) {
      return `{${part.replace(':', '')}}`
    }
    return part
  })
  return `${apiInfo.method.toUpperCase()}:${pathParts.join('/')}`
}
