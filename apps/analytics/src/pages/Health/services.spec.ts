import { dataApiURL }            from '@acx-ui/analytics/services'
import { store }                 from '@acx-ui/store'
import { mockGraphqlQuery }      from '@acx-ui/test-utils'
import { NetworkPath, NodeType } from '@acx-ui/utils'

import { configApi } from './services'

describe('configApi', () => {
  afterEach(() =>
    store.dispatch(configApi.util.resetApiState())
  )

  it('should return correct data for fetchThreshold query', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath,
      configCode: ['userAuthentication' as 'userAuthentication']
    }

    const validData = {
      value: 100,
      updatedBy: 'testUser',
      updatedAt: '02-01-2022'
    }

    mockGraphqlQuery(dataApiURL, 'KPIThresholdQuery', {
      data: validData
    })

    const { status, data, error } = await store.dispatch(
      configApi.endpoints.fetchThreshold.initiate({
        path: validPayload.path,
        configCode: validPayload.configCode
      })
    )

    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(validData)
    expect(error).toBeUndefined()
  })

  it('should return error for fetchThreshold query', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath,
      configCode: ['userAuthentication' as 'userAuthentication', 'apCapacity' as 'apCapacity']
    }

    const invalidData = undefined

    const mockedError = 'unexpected config fetch error'

    mockGraphqlQuery(dataApiURL, 'KPIThresholdQuery', {
      data: invalidData,
      error: mockedError
    })

    const { status, data, error } = await store.dispatch(
      configApi.endpoints.fetchThreshold.initiate({
        path: validPayload.path,
        configCode: validPayload.configCode
      })
    )

    expect(status).toBe('rejected')
    expect(data).toBeUndefined()
    expect(error?.message).toMatch(mockedError)
  })


  it('should return correct data for fetchThresholdPermission query', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath
    }

    const validData = {
      ThresholdMutationAllowed: true
    }

    mockGraphqlQuery(dataApiURL, 'KPIThresholdPermissionQuery', {
      data: validData
    })

    const { status, data, error } = await store.dispatch(
      configApi.endpoints.fetchThresholdPermission.initiate({
        path: validPayload.path
      })
    )

    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(validData)
    expect(error).toBeUndefined()
  })

  it('should return error for fetchThresholdPermission query', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath
    }

    const invalidData = undefined

    const mockedError = 'unexpected permission fetch error'

    mockGraphqlQuery(dataApiURL, 'KPIThresholdPermissionQuery', {
      data: invalidData,
      error: mockedError
    })

    const { status, data, error } = await store.dispatch(
      configApi.endpoints.fetchThresholdPermission.initiate({
        path: validPayload.path
      })
    )

    expect(status).toBe('rejected')
    expect(data).toBeUndefined()
    expect(error?.message).toMatch(mockedError)
  })
})
