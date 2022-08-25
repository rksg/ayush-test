import { useIntl } from 'react-intl'

import { dataApiURL }                                                              from '@acx-ui/analytics/services'
import { Incident }                                                                from '@acx-ui/analytics/utils'
import { Provider, store }                                                         from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen, renderHook } from '@acx-ui/test-utils'

import { donutChartsApi } from './services'

import { transformData, transformSummary, NetworkImpact } from '.'

jest.mock('./config', () => {
  const { donutCharts, ...rest } = jest.requireActual('./config')
  return {
    ...rest,
    donutCharts: {
      ...donutCharts,
      test: {
        ...donutCharts['WLAN'],
        transformValueFn: (val: number) => val * 2
      }
    }
  }
})

interface ChildrenProps {
  height: number
  width: number
}
interface AutoSizerProps {
  children: (props: ChildrenProps) => JSX.Element
}
jest.mock('react-virtualized-auto-sizer', () =>
  (props: AutoSizerProps) => props.children({ height: 250, width: 250 })
)


const NetworkImpactData = { incident: {
  WLAN: {
    key: 'WLAN',
    count: 2,
    data: [{ key: 'ssid1', name: 'ssid1', value: 2 }, { key: 'ssid2', name: 'ssid2', value: 1 }]
  },
  reason: {
    key: 'reason',
    count: 2,
    data: [{ key: 'CCD_REASON_AAA_AUTH_FAIL', name: 'CCD_REASON_AAA_AUTH_FAIL', value: 2 }]
  },
  radio: {
    key: 'radio',
    count: 2,
    data: [{ key: '2.4', name: '2.4', value: 1 }, { key: '5', name: '5', value: 1 }] },
  clientManufacturer: {
    key: 'radio',
    count: 2,
    data: [
      { key: 'manufacturer1', name: 'manufacturer1', value: 1 },
      { key: 'manufacturer2', name: 'manufacturer2', value: 1 }
    ] }
} }

describe('transformData', () => {
  it('should return correct result', async () => {
    const { result } = renderHook(() => {
      return transformData(
        { ...NetworkImpactData.incident.WLAN, key: 'test' }, useIntl())
    })
    expect(result.current).toEqual([
      { color: '#D61119', key: 'ssid1', name: 'ssid1', value: 4 },
      { color: '#F9C34B', key: 'ssid2', name: 'ssid2', value: 2 }
    ])
  })
})

describe('transformSummary', () => {
  it('should return correct result when having dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const { result } = renderHook(() => {
      return transformSummary(NetworkImpactData.incident.WLAN, incident, useIntl())
    })
    expect(result.current).toEqual('This incident impacted 2 WLANs')
  })
  it('should return correct result when no dominanceFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const { result } = renderHook(() => {
      return transformSummary(NetworkImpactData.incident.reason, incident, useIntl())
    })
    expect(result.current).toEqual("100 % of failures caused by 'AAA Auth Failure'")
  })
  it('should return correct result when having transformKeyFn', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const { result } = renderHook(() => {
      return transformSummary(NetworkImpactData.incident.reason, incident, useIntl())
    })
    expect(result.current).toEqual("100 % of failures caused by 'AAA Auth Failure'")
  })
  it('should return correct result when no transformKeyFn', () => {
    const incident = { id: 'id', metadata: { dominant: { ssid: 'ssid2' } } } as Incident
    const { result } = renderHook(() => {
      return transformSummary(NetworkImpactData.incident.WLAN, incident, useIntl())
    })
    expect(result.current).toEqual('33 % of failures impacted ssid2 WLAN')
  })
})

describe('NetworkImpact', () => {
  const props ={
    incident: { id: 'id', metadata: { dominant: { } } } as Incident,
    charts: [ 'WLAN', 'radio', 'reason', 'clientManufacturer']
  }
  it('should match snapshot', async () => {
    store.dispatch(donutChartsApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'DonutCharts', {
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
