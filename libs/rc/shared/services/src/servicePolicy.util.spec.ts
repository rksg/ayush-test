import { AAAViewModalType, AAARbacViewModalType, Radius, TableResult, ApiVersionEnum, GetApiVersionHeader } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                   from '@acx-ui/types'
import { ApiInfo, createHttpRequest }                                                                       from '@acx-ui/utils'

import {
  accessControlActionMap,
  actionItem,
  comparePayload, comparisonObjectType,
  convertRbacDataToAAAViewModelPolicyList,
  covertAAAViewModalTypeToRadius,
  createFetchArgsBasedOnRbac,
  fetchAdditionalData, operateAction, profilePayload, updateActionItem
} from './servicePolicy.utils'

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

  describe('fetchAdditionData', () => {
    it('should fetch and process additional data correctly', async () => {
      const fetchData = {
        data: [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' }
        ]
      } as TableResult<{ id: number, value: string }>

      const processFn = jest.fn().mockImplementation(async (item) => {
        return { ...item, additionalValue: `extra_${item.value}` }
      })

      const result = await fetchAdditionalData(fetchData, processFn)

      expect(result).toEqual({
        data: {
          ...fetchData,
          data: [
            { id: 1, value: 'a', additionalValue: 'extra_a' },
            { id: 2, value: 'b', additionalValue: 'extra_b' }
          ]
        }
      })

      expect(processFn).toHaveBeenCalledTimes(fetchData.data.length)
    })
  })

  describe('comparePayload and operateAction', () => {

    const currentPayload: profilePayload = {
      id: '832ad540d6aa4dfc802a07e04e43f29d',
      name: 'acl-temp-003',
      description: '',
      l2AclPolicy: {
        enabled: true,
        id: '13e531e332e543cd97c1122e581c707c'
      },
      l3AclPolicy: {
        enabled: true,
        id: 'b1a39dd622984eac855fadbf719b8317'
      },
      applicationPolicy: {
        enabled: true,
        id: '11c545eacd9742bdacfeb21cbb043221'
      }
    }

    const oldPayload: profilePayload = {
      devicePolicy: {
        id: '3936bc7f94fa40c4a1b6d52991e65fad',
        enabled: true
      },
      l2AclPolicy: {
        id: 'b9d7efc6e3ac4f18a8163c0744f5a727',
        enabled: true
      },
      applicationPolicy: {
        id: '11c545eacd9742bdacfeb21cbb043221',
        enabled: true
      },
      name: 'acl-temp-003',
      id: '832ad540d6aa4dfc802a07e04e43f29d'
    }

    // eslint-disable-next-line max-len
    const itemProcessFn = (currentPayload: profilePayload, oldPayload: profilePayload, key: string, id: string) => {
      const idName = `${key}Id`

      if (!Object.keys(oldPayload).length) {
        const keyObject = currentPayload[key] as { id: string }
        return {
          [idName]: { policyId: id, [idName]: keyObject.id }
        } as actionItem
      }

      const oldObject = oldPayload[key] as { id: string }
      const updateObject = currentPayload[key] as { id: string }
      return {
        [idName]: {
          oldAction: { policyId: id, [idName]: oldObject.id },
          action: { policyId: id, [idName]: updateObject.id }
        }
      } as updateActionItem
    }

    it('should correctly identify added, removed and updated items', () => {
      const expectedComparisonObject: comparisonObjectType = {
        added: [
          {
            descriptionId: {
              policyId: '832ad540d6aa4dfc802a07e04e43f29d'
            }
          },
          {
            l3AclPolicyId: {
              policyId: '832ad540d6aa4dfc802a07e04e43f29d',
              l3AclPolicyId: 'b1a39dd622984eac855fadbf719b8317'
            }
          }
        ],
        removed: [
          {
            devicePolicyId: {
              policyId: '832ad540d6aa4dfc802a07e04e43f29d',
              devicePolicyId: '3936bc7f94fa40c4a1b6d52991e65fad'
            }
          }
        ],
        updated: [
          {
            l2AclPolicyId: {
              oldAction: {
                policyId: '832ad540d6aa4dfc802a07e04e43f29d',
                l2AclPolicyId: 'b9d7efc6e3ac4f18a8163c0744f5a727'
              },
              action: {
                policyId: '832ad540d6aa4dfc802a07e04e43f29d',
                l2AclPolicyId: '13e531e332e543cd97c1122e581c707c'
              }
            }
          },
          {
            applicationPolicyId: {
              oldAction: {
                policyId: '832ad540d6aa4dfc802a07e04e43f29d',
                applicationPolicyId: '11c545eacd9742bdacfeb21cbb043221'
              },
              action: {
                policyId: '832ad540d6aa4dfc802a07e04e43f29d',
                applicationPolicyId: '11c545eacd9742bdacfeb21cbb043221'
              }
            }
          }
        ]
      }

      // eslint-disable-next-line max-len
      const result = comparePayload(currentPayload, oldPayload, '832ad540d6aa4dfc802a07e04e43f29d', itemProcessFn)

      expect(result).toEqual(expectedComparisonObject)
    })

    it('should correctly issue the request depend on the comparison results', async () => {
      const mockFetchWithBQ = jest.fn()
      // eslint-disable-next-line max-len
      const comparisonResult = comparePayload(currentPayload, oldPayload, '832ad540d6aa4dfc802a07e04e43f29d', itemProcessFn)

      await operateAction(comparisonResult, accessControlActionMap, mockFetchWithBQ, true)

      expect(mockFetchWithBQ).toHaveBeenCalledTimes(6) // add: 1, removed: 1, updated: 2 * 2
    })
  })
})
