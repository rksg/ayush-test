import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }             from '@acx-ui/store'
import { render }               from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { useGetNetwork } from '../services'

import { NetworkOverviewTab } from './index'

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  ConnectedClientsOverTime: () => <div></div>,
  NetworkHistory: () => <div></div>,
  TopApplicationsByTraffic: () => <div></div>,
  TrafficByVolume: () => <div></div>,
  VenueHealth: () => <div></div>,
  IncidentBySeverityDonutChart: () => <div></div>,
  KpiWidget: ({ filters }: { filters: AnalyticsFilter }) =>
    <div>{JSON.stringify(filters.filter)}</div>,
  TtcTimeWidget: () => <div></div>
}))
const mockUseGetNetwork = useGetNetwork as jest.Mock

jest.mock('../services', () => ({
  extractSSIDFilter: () => [],
  useGetNetwork: jest.fn()
}))
describe('NetworkOverviewTab', () => {
  afterEach(() => {
    mockUseGetNetwork.mockClear()
  })
  it('should render network overview tab successfully with no network data', () => {
    mockUseGetNetwork.mockImplementationOnce(() => ({}))
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkOverviewTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })
  it('should render network overview tab successfully', () => {
    mockUseGetNetwork.mockImplementationOnce(() => ({ data: { type: 'psk' } }))
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkOverviewTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })
  it('should render network overview tab with venue filter', () => {
    mockUseGetNetwork.mockImplementationOnce(() => ({ data: { type: 'psk' } }))
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkOverviewTab selectedVenues={['venue1', 'venue2']} />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })
})

