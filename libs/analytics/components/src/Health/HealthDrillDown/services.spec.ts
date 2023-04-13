import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockConnectionDrillDown, mockTtcDrillDown } from './__tests__/fixtures'
import { api, RequestPayload }                       from './services'

describe('Connection drill down api', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    path: [{ name: 'Network', type: 'network' }],
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  it('should return correct data for connection DrillDown', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    const { status, data, error } = await store.dispatch(
      api.endpoints.connectionDrilldown.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockConnectionDrillDown)
    expect(error).toBe(undefined)
  })
  it('should return error for connection DrillDown', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.connectionDrilldown.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
  it('should return correct data for ttc DrillDown', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockTtcDrillDown })
    const { status, data, error } = await store.dispatch(
      api.endpoints.ttcDrilldown.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockTtcDrillDown)
    expect(error).toBe(undefined)
  })
  it('should return error for ttc DrillDown', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.ttcDrilldown.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
