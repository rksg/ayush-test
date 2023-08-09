import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { kpiForOverview,  kpiForConnection } from '../__tests__/fixtures'
import { ConfigChangeProvider }              from '../context'

import { KPIs } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  kpisForTab: () => ({
    overview: {
      kpis: [
        'connectionSuccess',
        'timeToConnect',
        'clientThroughput',
        'apCapacity',
        'apServiceUptime',
        'onlineAPs',
        'switchPoeUtilization'
      ]
    },
    connection: {
      kpis: [
        'userAuthentication'
      ]
    }
  })
}))

describe('KPIs', () => {
  it('should render KPIs correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <KPIs />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    expect(await screen.findByText('Connection Success')).toBeVisible()
    expect(await screen.findByText('Before: 74.76% | After: 69.2%')).toBeVisible()
    expect(await screen.findByText('-5.56%')).toBeVisible()

    expect(await screen.findByText('Time To Connect')).toBeVisible()
    expect(await screen.findByText('Before: 895 ms | After: 26 ms')).toBeVisible()
    expect(await screen.findByText('-97.1%')).toBeVisible()

    expect(await screen.findByText('Client Throughput')).toBeVisible()
    expect(await screen.findByText('Before: 233 Mbps | After: --')).toBeVisible()
    expect(await screen.findAllByText('--')).toHaveLength(3)

    expect(await screen.findByText('AP Capacity')).toBeVisible()
    expect(await screen.findByText('Before: 10 Mbps | After: --')).toBeVisible()

    expect(await screen.findByText('AP-RUCKUS One Connection Uptime')).toBeVisible()
    expect(await screen.findByText('Before: -- | After: --')).toBeVisible()

    expect(await screen.findByText('Online APs Count')).toBeVisible()
    expect(await screen.findByText('Before: 7 | After: 3')).toBeVisible()
    expect(await screen.findByText('-57.14%')).toBeVisible()
  })
  it('should show corresponding KPIs when dropdown changes', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForConnection } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <KPIs />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    expect(await screen.findByText('Connection Success')).toBeVisible()
    const trigger = await screen.findByText('Overview')
    expect(trigger).toHaveTextContent('Overview')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Connection' }))
    expect(trigger).toHaveTextContent('Connection')
    expect(await screen.findByText('802.11 Authentication Success')).toBeVisible()
  })
  it('should handle onClick when KPI is clicked', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    const { asFragment } = render(
      <ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
        <KPIs />
      </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    expect(await screen.findByText('Connection Success')).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('.statistic-selected')).toBeNull()

    await userEvent.click(await screen.findByText('Connection Success'))

    expect(await screen.findByText('Connection Success')).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('.statistic-selected')).not.toBeNull()
  })
})
