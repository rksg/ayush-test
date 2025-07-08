import { TableResult } from '@acx-ui/utils'

import {
  accessControlActionMap,
  ActionItem,
  comparePayload,
  ComparisonObjectType,
  fetchAdditionalData,
  operateAction,
  UpdateActionItem
} from './accessControl'

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

  const currentPayload: Record<string, unknown> = {
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

  const oldPayload: Record<string, unknown> = {
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
  const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown>, key: string, id: string) => {
    const idName = `${key}Id`

    if (!Object.keys(oldPayload).length) {
      const keyObject = currentPayload[key] as { id: string }
      return {
        [idName]: { policyId: id, [idName]: keyObject.id }
      } as ActionItem
    }

    const oldObject = oldPayload[key] as { id: string }
    const updateObject = currentPayload[key] as { id: string }
    return {
      [idName]: {
        oldAction: { policyId: id, [idName]: oldObject.id },
        action: { policyId: id, [idName]: updateObject.id }
      }
    } as UpdateActionItem
  }

  it('should correctly identify added, removed and updated items', () => {
    const expectedComparisonObject: ComparisonObjectType = {
      added: [
        {
          idId: {
            nameId: undefined,
            policyId: '832ad540d6aa4dfc802a07e04e43f29d'
          }
        },
        {
          nameId: {
            nameId: undefined,
            policyId: '832ad540d6aa4dfc802a07e04e43f29d'
          }
        },
        {
          descriptionId: {
            policyId: '832ad540d6aa4dfc802a07e04e43f29d'
          }
        },
        {
          l2AclPolicyId: {
            l2AclPolicyId: '13e531e332e543cd97c1122e581c707c',
            policyId: '832ad540d6aa4dfc802a07e04e43f29d'
          }
        },
        {
          l3AclPolicyId: {
            policyId: '832ad540d6aa4dfc802a07e04e43f29d',
            l3AclPolicyId: 'b1a39dd622984eac855fadbf719b8317'
          }
        },
        {
          applicationPolicyId: {
            applicationPolicyId: '11c545eacd9742bdacfeb21cbb043221',
            policyId: '832ad540d6aa4dfc802a07e04e43f29d'
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

    expect(mockFetchWithBQ).toHaveBeenCalledTimes(8) // add: 3, removed: 1, updated: 2 * 2
  })
})


