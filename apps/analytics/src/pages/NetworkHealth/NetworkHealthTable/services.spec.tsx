import { networkHealthApiURL }                   from '@acx-ui/analytics/services'
import { store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation } from '@acx-ui/test-utils'

import { api  } from './services'

describe('networkHealth query', () => {
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
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: [] }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHealth.initiate({})
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual([])
    expect(error).toBe(undefined)
  })
  it('should return correct data', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', { data: expectedResult })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHealth.initiate({})
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.allServiceGuardSpecs)
    expect(error).toBe(undefined)
  })
})

describe('networkHealthDelete mutation', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('handles delete mutation', async () => {
    const data = {
      deletedSpecId: 'spec-id',
      userErrors: null
    }
    const expected = {
      data: data
    }
    mockGraphqlMutation(networkHealthApiURL, 'DeleteServiceGuardSpec', {
      data: { deleteServiceGuardSpec: data }
    })
    const result = await store.dispatch(
      api.endpoints.networkHealthDelete.initiate({ id: 'spec-id' })
    )
    expect(result).toEqual(expected)
  })
})

describe('networkHealthRun mutation', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('handles run mutation', async () => {
    const data = {
      deletedSpecId: 'spec-id',
      userErrors: null
    }
    const expected = {
      data: data
    }
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', {
      data: { runServiceGuardTest: data }
    })
    const result = await store.dispatch(
      api.endpoints.networkHealthRun.initiate({ id: 'spec-id' })
    )
    expect(result).toEqual(expected)
  })
})
