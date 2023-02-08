import { networkhealthURL } from '@acx-ui/analytics/services'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { api } from './services'

describe('networkHealthApi', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const expectedResult = {
    allServiceGuardSpecs: [{
      id: '3d51e2f0-6a1f-4641-94a4-9feb3803edff',
      name: 'testCase',
      type: 'on-demand',
      apsCount: 10,
      userId: 'anything',
      clientType: 'virtual-client',
      schedule: null,
      tests: {
        items: [{
          id: 1,
          createdAt: '2023-02-06T20:17:05.973Z',
          summary: {
            apsTestedCount: 10,
            apsSuccessCount: 2,
            apsPendingCount: 0
          }
        }]
      }
    }]
  }

  it('should return empty data', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', { data: { allServiceGuardSpecs: [] } })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHealth.initiate({})
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual([])
    expect(error).toBe(undefined)
  })
  it('should return correct data', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', { data: expectedResult })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHealth.initiate({})
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.allServiceGuardSpecs)
    expect(error).toBe(undefined)
  })
})
