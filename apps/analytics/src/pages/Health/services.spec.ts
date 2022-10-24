import { SerializedError } from '@reduxjs/toolkit'

import { dataApiURL }                            from '@acx-ui/analytics/services'
import { store }                                 from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery } from '@acx-ui/test-utils'
import { NetworkPath, NodeType }                 from '@acx-ui/utils'

import { configApi } from './services'

describe('configApi', () => {
  afterEach(() =>
    store.dispatch(configApi.util.resetApiState())
  )

  it('should return correct data for fetchThresholdPermission query', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath
    }

    const validData = {
      ThresholdMutationAllowed: true
    }

    mockGraphqlQuery(dataApiURL, 'KPI', {
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

    mockGraphqlQuery(dataApiURL, 'KPI', {
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

  it('should return correct data for saveThreshold mutation', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath
    }

    const validData = {
      mutationAllowed: true
    }

    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: validData
    })

    const response = await store.dispatch(
      configApi.endpoints.saveThreshold.initiate({
        path: validPayload.path,
        name: 'apCapacity',
        value: 30
      })
    )

    expect(response).toBeDefined()
    expect(response).toMatchObject({ data: validData })
  })

  it('should return error for saveThreshold mutation', async () => {
    const validPayload = {
      path: [{ name: 'Network', type: 'Network' as NodeType }] as NetworkPath
    }

    const invalidData = undefined

    const mockedError = 'unexpected permission fetch error'

    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: invalidData,
      error: mockedError
    })

    const response = await store.dispatch(
      configApi.endpoints.saveThreshold.initiate({
        path: validPayload.path,
        name: 'apCapacity',
        value: 30
      })
    )

    const errResponse = response as unknown as SerializedError
    expect(errResponse).toBeDefined()
    expect(errResponse.message).toBeUndefined()
  })
})
