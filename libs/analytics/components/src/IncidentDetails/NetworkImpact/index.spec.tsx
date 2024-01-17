import { Incident }                                                    from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'

import { NetworkImpactChartTypes, NetworkImpactQueryTypes, networkImpactChartConfigs } from './config'
import { networkImpactChartsApi }                                                      from './services'

import { transformData, transformSummary, NetworkImpact, NetworkImpactProps } from '.'

const networkImpactData = { incident: {
  [NetworkImpactChartTypes.WLAN]: {
    count: 2,
    data: [{ key: 'ssid1', name: 'ssid1', value: 2 }, { key: 'ssid2', name: 'ssid2', value: 1 }]
  },
  [NetworkImpactChartTypes.Reason]: {
    count: 2,
    data: [{ key: 'CCD_REASON_AAA_AUTH_FAIL', name: 'CCD_REASON_AAA_AUTH_FAIL', value: 2 }]
  },
  [NetworkImpactChartTypes.Radio]: {
    count: 2,
    data: [{ key: '2.4', name: '2.4', value: 1 }, { key: '5', name: '5', value: 1 }] },
  [NetworkImpactChartTypes.ClientManufacturer]: {
    key: 'clientManufacturer',
    count: 2,
    data: [
      { key: 'manufacturer1', name: 'manufacturer1', value: 1 },
      { key: 'manufacturer2', name: 'manufacturer2', value: 1 }
    ] },
  [NetworkImpactChartTypes.AirtimeBusy]: {
    peak: 0.65,
    summary: 0.5,
    data: [
      { key: 'airtimeBusy', name: 'airtimeBusy', value: 0.5 },
      { key: 'airtimeRx', name: 'airtimeRx', value: 0.3 },
      { key: 'airtimeTx', name: 'airtimeTx', value: 0.1 },
      { key: 'airtimeIdle', name: 'airtimeIdle', value: 0.1 }
    ]
  },
  [`${NetworkImpactChartTypes.AirtimeBusy}Peak`]: 0.65,
  [NetworkImpactChartTypes.AirtimeClientsByAP]: {
    peak: 60,
    summary: 27.5,
    data: [
      { key: 'small', name: 'small', value: 2 },
      { key: 'medium', name: 'medium', value: 1 },
      { key: 'large', name: 'airtimTex', value: 1 }
    ]
  },
  [`${NetworkImpactChartTypes.AirtimeClientsByAP}Peak`]: 60
} }

describe('transformData', () => {
  it('should return correct result', async () => {
    const result = transformData(
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      networkImpactData.incident.WLAN
    )
    expect(result).toEqual([
      { color: '#66B1E8', key: 'ssid1', name: 'ssid1', value: 2 },
      { color: '#EC7100', key: 'ssid2', name: 'ssid2', value: 1 }
    ])
  })
  it('should return correct result for airtime', async () => {
    const result = transformData(
      networkImpactChartConfigs[NetworkImpactChartTypes.AirtimeBusy],
      networkImpactData.incident[NetworkImpactChartTypes.AirtimeBusy]
    )
    expect(result).toEqual([
      { color: '#66B1E8', key: 'airtimeBusy', name: 'Avg Airtime Busy', value: 0.5 },
      { color: '#EC7100', key: 'airtimeRx', name: 'Avg Airtime Rx', value: 0.3 },
      { color: '#F9C34B', key: 'airtimeTx', name: 'Avg Airtime Tx', value: 0.1 },
      { color: '#F095FF', key: 'airtimeIdle', name: 'Avg Airtime Idle', value: 0.1 }
    ])
  })
})

describe('transformSummary', () => {
  it('should return correct result when having dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const result = transformSummary(
      NetworkImpactQueryTypes.TopN,
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      networkImpactData.incident.WLAN,
      incident
    )
    expect(result).toEqual('This incident impacted 2 WLANs')
  })
  it('should return correct result when no dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const result = transformSummary(
      NetworkImpactQueryTypes.TopN,
      networkImpactChartConfigs[NetworkImpactChartTypes.Reason],
      networkImpactData.incident.reason,
      incident
    )
    expect(result).toEqual("100% of failures caused by 'AAA Auth Failure'")
  })
  it('should return correct result when no transformKeyFn', () => {
    const incident = { id: 'id', metadata: { dominant: { ssid: 'ssid2' } } } as Incident
    const result = transformSummary(
      NetworkImpactQueryTypes.TopN,
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      networkImpactData.incident.WLAN,
      incident
    )
    expect(result).toEqual('33% of failures impacted ssid2')
  })
  it('should return correct result for NetworkImpactQueryTypes = distribution', () => {
    const incident = { id: 'id' } as Incident
    const result = transformSummary(
      NetworkImpactQueryTypes.Distribution,
      networkImpactChartConfigs[NetworkImpactChartTypes.AirtimeBusy],
      networkImpactData.incident.airtimeBusy,
      incident
    )
    expect(result).toEqual('Peak airtime busy was 65%')
  })
})

describe('NetworkImpact', () => {
  const props: NetworkImpactProps = {
    incident: { id: 'id', metadata: { dominant: { } } } as Incident,
    charts: [{
      chart: NetworkImpactChartTypes.WLAN,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'ssids'
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
      chart: NetworkImpactChartTypes.Radio,
      query: NetworkImpactQueryTypes.TopN,
      type: 'client',
      dimension: 'radios'
    },
    {
      chart: NetworkImpactChartTypes.AirtimeBusy,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtimeMetric',
      dimension: 'airtimeBusy'
    },
    {
      chart: NetworkImpactChartTypes.AirtimeClientsByAP,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtimeClientsByAP',
      dimension: 'summary'
    },
    { // config disabled, chart not disabled
      chart: NetworkImpactChartTypes.AirtimeClientsByAP,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtimeClientsByAP',
      dimension: 'summary'
    }]
  }
  it('should match snapshot', async () => {
    store.dispatch(networkImpactChartsApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', {
      data: networkImpactData
    })
    const { asFragment } = render(<Provider><NetworkImpact {...props}/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })

  it('handles charts data with total & disabled', async () => {
    store.dispatch(networkImpactChartsApi.util.resetApiState())
    const newProps: NetworkImpactProps = {
      ...props,
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
    const data = {
      incident: {
        [NetworkImpactChartTypes.RxPhyErrByAP]: {
          count: 10,
          total: 10,
          data: [{ key: '00:00:00:00:00:00', value: 10 }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', { data })
    const { asFragment } = render(<NetworkImpact {...newProps} />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })

  it('handles charts data disabled', async () => {
    store.dispatch(networkImpactChartsApi.util.resetApiState())
    const newProps: NetworkImpactProps = {
      ...props,
      charts: [{
        chart: NetworkImpactChartTypes.RogueAPByChannel,
        query: NetworkImpactQueryTypes.TopN,
        type: 'rogueAp',
        dimension: 'rogueChannel'
      },
      {
        chart: NetworkImpactChartTypes.RxPhyErrByAP,
        query: NetworkImpactQueryTypes.TopN,
        type: 'apAirtime',
        dimension: 'phyError'
      }]
    }
    const data = {
      incident: {
        [NetworkImpactChartTypes.RogueAPByChannel]: {
          count: 10,
          total: 10,
          data: [{ key: '00:00:00:00:00:00', value: 10 }]
        },
        [NetworkImpactChartTypes.RxPhyErrByAP]: {
          count: 10,
          total: 10,
          data: [{ key: '00:00:00:00:00:00', value: 10 }]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', { data })
    const { asFragment } = render(<NetworkImpact {...newProps} />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})
