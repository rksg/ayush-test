import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockConnectionFailureResponse, mockPathWithAp, mockTtcResponse } from './__tests__/fixtures'
import { api, pieChartQuery, RequestPayload }                             from './services'

describe('HealthPieChart services', () => {
  afterEach(() => store.dispatch(api.util.resetApiState()))

  const payload: RequestPayload = {
    path: [{ name: 'Network', type: 'network' }],
    start: '2023-03-15T00:00:00+00:00',
    end: '2023-03-16T00:00:00+00:00',
    queryType: 'connectionFailure',
    queryFilter: 'connectionFailure'
  }

  describe('pieChartQuery', () => {
    it('should handle unepxected key', () => {
      const empty = pieChartQuery(payload.path, 'wrong', 'wrong')
      expect(empty).toMatch('')
    })
  })

  it('should return correct connectionFailure data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.pieChart.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockConnectionFailureResponse)
    expect(error).toBeUndefined()
  })

  it('should return correct connectionFailure data with AP', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.pieChart.initiate({
        ...payload,
        path: mockPathWithAp
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockConnectionFailureResponse)
    expect(error).toBeUndefined()
  })

  it('should return correct timeToConnect data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTtcResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.pieChart.initiate({
        ...payload, queryFilter: 'timeToConnect', queryType: 'timeToConnect'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockTtcResponse)
    expect(error).toBeUndefined()
  })

  it('should return correct timeToConnect data with AP', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { status, data, error } = await store.dispatch(
      api.endpoints.pieChart.initiate({
        ...payload,
        path: mockPathWithAp,
        queryFilter: 'timeToConnect',
        queryType: 'timeToConnect'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockConnectionFailureResponse)
    expect(error).toBeUndefined()
  })

  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.pieChart.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
