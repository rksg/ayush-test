import { Provider, dataApiURL }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { kpiChanges } from '../__tests__/fixtures'

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
    }
  })
}))

describe('KPIs', () => {
  it('should render KPIs correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: kpiChanges })
    render(<KPIs kpiTimeRanges={[[0, 50], [950, 1000]]}/>, { wrapper: Provider, route: {} })

    expect(await screen.findByText('Connection Success')).toBeVisible()
    expect(await screen.findByText('Before: 74.76% | After: 69.2%')).toBeVisible()
    expect(await screen.findByText('-7.44%')).toBeVisible()

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
})