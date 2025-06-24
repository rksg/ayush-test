import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { NetworkImpactChartTypes, NetworkImpactQueryTypes  } from './config'
import { networkImpactChartsApi, RequestPayload  }           from './services'

describe('networkImpactChartsApi', () => {
  const payload = {
    incident: { id: 'id', metadata: { dominant: { } } },
    charts: [{
      chart: NetworkImpactChartTypes.WLAN,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'ssids'
    }, {
      chart: NetworkImpactChartTypes.Radio,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'radios'
    }, {
      chart: NetworkImpactChartTypes.Reason,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'reasonCodes'
    }, {
      chart: NetworkImpactChartTypes.ClientManufacturer,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'manufacturer'
    }, {
      chart: NetworkImpactChartTypes.AirtimeBusy,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtime',
      dimension: 'airtimeBusy'
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
      ] },
      airtimeBusy: {
        summary: 0.5,
        data: [
          { key: 'airtimBusy', value: 0.5 },
          { key: 'airtimRx', value: 0.3 },
          { key: 'airtimTx', value: 0.1 },
          { key: 'airtimIdle', value: 0.1 }
        ] },
      airtimeBusyPeak: 0.65
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

  it('does not send query for disabled config and use default data', async () => {
    const expectedResult = {
      incident: {
        [NetworkImpactChartTypes.RxPhyErrByAP]: {
          count: 10,
          total: 10,
          data: [{ key: '00:00:00:00:00:00', value: 10 }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', {
      data: expectedResult
    })
    const newPayload: RequestPayload = {
      ...payload,
      charts: [{
        chart: NetworkImpactChartTypes.RogueAPByChannel,
        query: NetworkImpactQueryTypes.TopN,
        type: 'rogueAp',
        dimension: 'rogueChannel',
        disabled: true
      },
      {
        chart: NetworkImpactChartTypes.RxPhyErrByAP,
        query: NetworkImpactQueryTypes.TopN,
        type: 'apAirtime',
        dimension: 'phyError'
      }]
    }
    const { status, data, error } = await store.dispatch(
      networkImpactChartsApi.endpoints.networkImpactCharts.initiate(newPayload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toMatchSnapshot()
    expect(error).toBe(undefined)
  })
})
