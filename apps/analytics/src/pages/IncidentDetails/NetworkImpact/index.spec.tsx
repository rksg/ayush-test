import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { Incident }                                                    from '@acx-ui/analytics/utils'
import { Provider, store }                                             from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'

import { NetworkImpactChartTypes, networkImpactChartConfigs } from './config'
import { networkImpactChartsApi }                             from './services'

import { transformData, transformSummary, NetworkImpact, NetworkImpactProps } from '.'

const NetworkImpactData = { incident: {
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
    ] }
} }

describe('transformData', () => {
  it('should return correct result', async () => {
    const result = transformData(
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      NetworkImpactData.incident.WLAN
    )
    expect(result).toEqual([
      { color: '#D61119', key: 'ssid1', name: 'ssid1', value: 2 },
      { color: '#F9C34B', key: 'ssid2', name: 'ssid2', value: 1 }
    ])
  })
})

describe('transformSummary', () => {
  it('should return correct result when having dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const result = transformSummary(
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      NetworkImpactData.incident.WLAN,
      incident
    )
    expect(result).toEqual('This incident impacted 2 WLANs')
  })
  it('should return correct result when no dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const result = transformSummary(
      networkImpactChartConfigs[NetworkImpactChartTypes.Reason],
      NetworkImpactData.incident.reason,
      incident
    )
    expect(result).toEqual("100% of failures caused by 'AAA Auth Failure'")
  })
  it('should return correct result when no transformKeyFn', () => {
    const incident = { id: 'id', metadata: { dominant: { ssid: 'ssid2' } } } as Incident
    const result = transformSummary(
      networkImpactChartConfigs[NetworkImpactChartTypes.WLAN],
      NetworkImpactData.incident.WLAN,
      incident
    )
    expect(result).toEqual('33% of failures impacted ssid2')
  })
})

describe('NetworkImpact', () => {
  const props: NetworkImpactProps = {
    incident: { id: 'id', metadata: { dominant: { } } } as Incident,
    charts: [{
      chart: NetworkImpactChartTypes.WLAN,
      type: 'client',
      dimension: 'ssids'
    }, {
      chart: NetworkImpactChartTypes.Reason,
      type: 'client',
      dimension: 'reasonCodes'
    }, {
      chart: NetworkImpactChartTypes.ClientManufacturer,
      type: 'client',
      dimension: 'manufacturer'
    }, {
      chart: NetworkImpactChartTypes.Radio,
      type: 'client',
      dimension: 'radios'
    }]
  }
  it('should match snapshot', async () => {
    store.dispatch(networkImpactChartsApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkImpactCharts', {
      data: NetworkImpactData
    })
    const { asFragment } = render(<Provider><NetworkImpact {...props}/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})
