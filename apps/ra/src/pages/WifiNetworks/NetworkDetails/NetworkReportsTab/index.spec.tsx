import '@testing-library/jest-dom'
import { Provider }        from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { NetworkDetailsReportTab } from './index'

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

describe('NetworkDetailsReportTab', () => {
  it('renders without crashing', () => {
    render(<NetworkDetailsReportTab />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(screen.getByText('Network Overview')).toBeInTheDocument()
  })
})
