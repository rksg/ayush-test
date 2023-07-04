import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockConnectionDrillDown, mockTtcDrillDown, mockImpactedClient, mockConnectionFailureResponse, mockPathWithAp, mockTtcResponse } from './__tests__/fixtures'
import { api, RequestPayload, pieChartQuery, PieChartPayload  }                                                                          from './services'

describe('Connection drill down api', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    filter: {},
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  const impactedClientPayload: RequestPayload & {
    field: string;
    topImpactedClientLimit: number;
    stage: string;
  } = {
    ...payload,
    field: 'topNImpactedClientbyConnFailure',
    stage: 'radius',
    topImpactedClientLimit: 100
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
    mockGraphqlQuery(dataApiURL, 'TTCDrilldown', { data: mockTtcDrillDown })
    const { status, data, error } = await store.dispatch(
      api.endpoints.ttcDrilldown.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockTtcDrillDown)
    expect(error).toBe(undefined)
  })
  it('should return error for ttc DrillDown', async () => {
    mockGraphqlQuery(dataApiURL, 'TTCDrilldown', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.ttcDrilldown.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })

  describe('HealthPieChart services', () => {
    afterEach(() => store.dispatch(api.util.resetApiState()))

    const payload: PieChartPayload = {
      filter: {},
      start: '2023-03-15T00:00:00+00:00',
      end: '2023-03-16T00:00:00+00:00',
      queryType: 'connectionFailure',
      queryFilter: 'connectionFailure'
    }

    describe('pieChartQuery', () => {
      it('should handle unepxected key', () => {
        const empty = pieChartQuery(payload.filter, 'wrong', 'wrong')
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
          filter: { networkNodes: [mockPathWithAp] }
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
          ...payload, queryFilter: 'ttc', queryType: 'ttc'
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
          filter: { networkNodes: [mockPathWithAp] },
          queryFilter: 'ttc',
          queryType: 'ttc'
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

  it('should return correct data for impacted client', async () => {


    mockGraphqlQuery(dataApiURL, 'Network', { data: mockImpactedClient })
    const { status, data, error } = await store.dispatch(
      api.endpoints.healthImpactedClients.initiate(impactedClientPayload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockImpactedClient)
    expect(error).toBe(undefined)
  })

  it('should return error for for impacted client', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.healthImpactedClients.initiate(impactedClientPayload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
