import { dataApiURL }       from '@acx-ui/analytics/services'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { NetworkImpactChartTypes  }                from './config'
import { networkImpactChartsApi, RequestPayload  } from './services'

describe('networkImpactChartsApi', () => {
  const payload = {
    incident: { id: 'id', metadata: { dominant: { } } },
    charts: [{
      chart: NetworkImpactChartTypes.WLAN,
      type: 'client',
      dimension: 'ssids'
    }, {
      chart: NetworkImpactChartTypes.Radio,
      type: 'client',
      dimension: 'radios'
    }, {
      chart: NetworkImpactChartTypes.Reason,
      type: 'client',
      dimension: 'reasonCodes'
    }, {
      chart: NetworkImpactChartTypes.ClientManufacturer,
      type: 'client',
      dimension: 'manufacturer'
    }]
  } as RequestPayload
  afterEach(() =>
    store.dispatch(networkImpactChartsApi.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = { incident: {
      WLAN: { count: 2, data: [
        { key: 'ssid1', value: 2 }, { key: 'ssid2', value: 1 }
      ] },
      reason: { count: 2, data: [
        { key: 'CCD_REASON_AAA_AUTH_FAIL', value: 2 }
      ] },
      radio: { count: 2, data: [
        { key: '2.4', value: 1 }, { key: '5', value: 1 }
      ] },
      clientManufacturer: { count: 2, data: [
        { key: 'manufacturer1', value: 1 }, { key: 'manufacturer2', value: 1 }
      ] }
    } }
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      networkImpactChartsApi.endpoints.networkImpactCharts.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toMatchSnapshot()
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      networkImpactChartsApi.endpoints.networkImpactCharts.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
