import { AAAViewModalType, AAARbacViewModalType, Radius, TableResult, ApiVersionEnum, GetApiVersionHeader } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                   from '@acx-ui/types'
import { ApiInfo, createHttpRequest }                                                                       from '@acx-ui/utils'

import { convertRbacDataToAAAViewModelPolicyList, covertAAAViewModalTypeToRadius, createFetchArgsBasedOnRbac } from './servicePolicy.utils'

jest.mock('@acx-ui/utils')

describe('servicePolicy.utils', () => {
  it('should convert RBAC data to AAA view model policy list', () => {
    const input: TableResult<AAARbacViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', wifiNetworkIds: ['network1', 'network2'] }
      ]
    }
    const expectedOutput: TableResult<AAAViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', networkIds: ['network1', 'network2'] }
      ]
    }
    expect(convertRbacDataToAAAViewModelPolicyList(input)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '192.168.1.2:9090',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 },
      secondary: { ip: '192.168.1.2', port: 9090 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius - empty secondary', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })

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
