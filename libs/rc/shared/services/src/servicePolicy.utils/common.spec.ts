import { ApiVersionEnum, GetApiVersionHeader } from '@acx-ui/rc/utils'
import { RequestPayload }                      from '@acx-ui/types'
import { ApiInfo, createHttpRequest }          from '@acx-ui/utils'

import { commonQueryFn } from '.'

jest.mock('@acx-ui/utils')

describe('servicePolicy.utils', () => {
  describe('createFetchArgsBasedOnRbac', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
      jest.mocked(createHttpRequest as any).mockImplementationOnce((apiInfo: ApiInfo, params: any, headers: any) => {
        return {
          method: apiInfo.method,
          url: apiInfo.url,
          ...(headers ? { headers } : {})
        }
      })
    })

    it('should create fetch args without RBAC', () => {
      const apiInfo: ApiInfo = { url: '/test', method: 'GET' }
      const queryArgs: RequestPayload = { payload: { key: 'value' }, enableRbac: false }
      const result = commonQueryFn(apiInfo)(queryArgs)

      expect(result).toEqual({ method: apiInfo.method, url: apiInfo.url, body: queryArgs.payload })
    })

    it('should create fetch args with RBAC', () => {
      const apiInfo: ApiInfo = { url: '/test', method: 'GET' }
      // eslint-disable-next-line max-len
      const rbacApiInfo: ApiInfo = { url: '/rbac/test', method: 'GET', defaultHeaders: { ...GetApiVersionHeader(ApiVersionEnum.v1) } }
      const queryArgs: RequestPayload = { payload: { key: 'value' }, enableRbac: true }

      const result = commonQueryFn(apiInfo, rbacApiInfo)(queryArgs)

      expect(result).toEqual({
        method: rbacApiInfo.method,
        url: rbacApiInfo.url,
        body: JSON.stringify(queryArgs.payload)
      })
    })
  })
})
