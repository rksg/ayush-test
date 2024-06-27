import { ApiVersionEnum, GetApiVersionHeader } from '@acx-ui/rc/utils'
import { RequestPayload }                      from '@acx-ui/types'
import { ApiInfo, createHttpRequest }          from '@acx-ui/utils'

import { createFetchArgsBasedOnRbac } from '.'

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
      // const apiVersionHeaders = GetApiVersionHeader(ApiVersionEnum.v1)

      const result = createFetchArgsBasedOnRbac({ apiInfo, queryArgs })

      expect(result).toEqual({ method: apiInfo.method, url: apiInfo.url, body: queryArgs.payload })
    })

    it('should create fetch args with RBAC', () => {
      const apiInfo: ApiInfo = { url: '/test', method: 'GET' }
      const rbacApiInfo: ApiInfo = { url: '/rbac/test', method: 'GET' }
      const queryArgs: RequestPayload = { payload: { key: 'value' }, enableRbac: true }

      const props = {
        apiInfo,
        rbacApiInfo,
        rbacApiVersionKey: ApiVersionEnum.v1,
        queryArgs
      }
      const result = createFetchArgsBasedOnRbac(props)

      expect(result).toEqual({
        method: rbacApiInfo.method,
        url: rbacApiInfo.url,
        headers: GetApiVersionHeader(ApiVersionEnum.v1),
        body: JSON.stringify(queryArgs.payload)
      })
    })
  })
})
