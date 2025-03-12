import { ReactElement, useState } from 'react'

import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { brushPeriod }                      from '@acx-ui/components'
import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { Provider, dataApiURL }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange, defaultRanges }         from '@acx-ui/utils'

import { kpiForOverview,  kpiForConnection }                                  from '../__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeContextType, ConfigChangeProvider } from '../context'

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
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))
  it('should render KPIs correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
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
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
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
      <ConfigChangeProvider dateRange={DateRange.last7Days}>
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
  it('should set correct context', async () => {
    const mockSetKpiFilter = jest.fn()
    const MockedProvider = (props: {
      children: ReactElement
    } & Pick<ConfigChangeContextType, 'dateRange'>) => {
      const timeRanges = defaultRanges()[props.dateRange]!
      const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([
        [timeRanges[0].valueOf(), timeRanges[0].clone().add(brushPeriod, 'ms').valueOf()],
        [timeRanges[1].clone().subtract(brushPeriod, 'ms').valueOf(), timeRanges[1].valueOf()]
      ])
      const [kpiFilter] = useState<string[]>([])
      const context = {
        ..._.omit(props, 'children'),
        kpiTimeRanges, setKpiTimeRanges, kpiFilter, setKpiFilter: mockSetKpiFilter }
      return <ConfigChangeContext.Provider
        value={context as unknown as ConfigChangeContextType}
        // eslint-disable-next-line testing-library/no-node-access
        children={props.children}
      />
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    render(
      <MockedProvider dateRange={DateRange.last7Days}><KPIs /></MockedProvider>,
      { wrapper: Provider, route: {} }
    )
    await userEvent.click(await screen.findByText('Connection Success'))
    expect(mockSetKpiFilter).toHaveBeenCalled()
  })
})
