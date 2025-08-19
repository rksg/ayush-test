import userEvent from '@testing-library/user-event'

import { healthApi }                   from '@acx-ui/analytics/services'
import { pathToFilter }                from '@acx-ui/analytics/utils'
import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  cleanup,
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { RolesEnum, TimeStampRange, WifiScopes }                     from '@acx-ui/types'
import { setUserProfile, getUserProfile }                            from '@acx-ui/user'
import { DateRange, NetworkPath, fixedEncodeURIComponent, NodeType } from '@acx-ui/utils'
import type { AnalyticsFilter }                                      from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import KpiSections, { KpiSection, defaultThreshold } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: jest.fn()
    .mockReturnValueOnce(null)
    .mockReturnValueOnce({ venueId: 'testTenant' })
    .mockReturnValue({})
}))

describe('Kpi Section', () => {
  beforeEach(() => {
    store.dispatch(healthApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: { timeToConnectThreshold: { value: 30000 } }
    })
  })

  afterEach(() => cleanup())

  const sampleTS = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [[10, 20], [null, null], [0, 0], [4, 5], [4, 5]]
  }
  const filters: AnalyticsFilter = {
    startDate: '2022-04-07T09:15:00.000Z',
    endDate: '2022-04-07T10:15:00.000Z',
    range: DateRange.last24Hours,
    filter: {}
  }
  const healthContext = {
    ...filters,
    timeWindow: [sampleTS.time[0], sampleTS.time[4]] as TimeStampRange,
    setTimeWindow: jest.fn()
  }

  it('should render disabled tooltip with network path', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: false }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { timeToConnect: { success: true }
      }
    })
    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const params = { tenantId: 'testTenant' }
    render(<Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext }}
      >
        <KpiSections tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
      </HealthPageContext.Provider>
    </Provider>, { route: { params, path: '/:tenantId' } })
    const loaders = await screen.findAllByRole('img', { name: 'loader' })
    expect(loaders.length).toBeGreaterThanOrEqual(1)
  })

  it('should render disabled tooltip with no permissions', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: false }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    const path =
      [{ type: 'network', name: 'Network' }, { type: 'zoneName', name: 'z1' }] as NetworkPath
    const filter = pathToFilter(path)
    const period = fixedEncodeURIComponent(JSON.stringify(filters))
    const analyticsNetworkFilter = fixedEncodeURIComponent(JSON.stringify({
      filter,
      raw: []
    }))

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSections tab={'overview'} filters={{ ...filters, filter }} />
      </HealthPageContext.Provider>
    </Provider>, {
      route: {
        // eslint-disable-next-line max-len
        path: `/tenantId/analytics/health?period=${period}&analyticsNetworkFilter=${analyticsNetworkFilter}`,
        wrapRoutes: false
      }
    })
    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const buttons = await screen.findAllByRole('button', { name: 'Apply' })
    expect(buttons[0]).toBeDisabled()
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(buttons[0].parentElement!)
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You don\'t have permission to set threshold for selected network node.')).toBeInTheDocument()
  }, 60000)

  it('should render valid threshold apply for single ap path', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })

    const path = [{ type: 'ap' as NodeType, name: 'z1' }] as NetworkPath
    const filter = pathToFilter(path)
    const period = fixedEncodeURIComponent(JSON.stringify(filters))
    const analyticsNetworkFilter = fixedEncodeURIComponent(JSON.stringify({
      filter,
      raw: []
    }))


    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSections tab={'overview'} filters={{ ...filters, filter }} />
      </HealthPageContext.Provider>
    </Provider>, {
      route: {
        path: '/:tenantId',
        params: { tenantId: 'testTenant' },
        search: `period=${period}&analyticsNetworkFilter=${analyticsNetworkFilter}`,
        wrapRoutes: false
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const buttons = await screen.findAllByRole('button', { name: 'Apply' })
    expect(buttons).toHaveLength(4)
    expect(buttons[0]).not.toBeDisabled()
  }, 60000)

  it('should render with smaller timewindow', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: false }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { timeToConnect: { success: true }
      }
    })
    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)
    render(<Router><Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext, filter }}
      >
        <KpiSections tab={'overview'}
          filters={{ ...filters, filter, endDate: sampleTS.data[2] as unknown as string }}
        />
      </HealthPageContext.Provider>
    </Provider></Router>)
    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/Time to Connect/i)).toBeInTheDocument()
  })

  it('should disable threshold setting when role = READ_ONLY', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: false }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { timeToConnect: { success: true }
      }
    })
    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const params = { tenantId: 'testTenant' }
    render(<Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext }}
      >
        <KpiSections tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
      </HealthPageContext.Provider>
    </Provider>, { route: { params, path: '/:tenantId' } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sliders = await screen.findAllByRole('slider')
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-disabled', 'true')
    })
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
  })
  it('should disable threshold setting when wifi-u is missing', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ]
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: false }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { timeToConnect: { success: true }
      }
    })
    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const params = { tenantId: 'testTenant' }
    render(<Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext }}
      >
        <KpiSections tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
      </HealthPageContext.Provider>
    </Provider>, { route: { params, path: '/:tenantId' } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sliders = await screen.findAllByRole('slider')
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-disabled', 'true')
    })
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
  })

  it('should render ContentSwitcher for sub-tab KPIs', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    // Mock sub-tab KPIs structure
    const subTabKpis = {
      System: ['switchMemoryUtilization', 'switchCpuUtilization'],
      Table: ['switchIpv4UnicastUtilization', 'switchIpv6UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Check that ContentSwitcher tabs are rendered
    expect(await screen.findByText('System')).toBeInTheDocument()
    expect(await screen.findByText('Table')).toBeInTheDocument()

    // Check that only first KPI from System tab is shown initially (due to loadMoreState)
    expect(await screen.findByText(/Memory Compliance/i)).toBeInTheDocument()
    expect(screen.queryByText(/CPU Compliance/i)).not.toBeInTheDocument()
  })

  it('should render ContentSwitcher with persistence attributes', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })

    // Mock sub-tab KPIs structure
    const subTabKpis = {
      System: ['switchMemoryUtilization'],
      Table: ['switchIpv4UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Verify that ContentSwitcher tabs are rendered (indicating it's working)
    expect(await screen.findByText('System')).toBeInTheDocument()
    expect(await screen.findByText('Table')).toBeInTheDocument()

    // Verify localStorage functionality by checking if switching tabs works
    const tableTab = screen.getByText('Table')
    await userEvent.click(tableTab)

    // After clicking Table, it should show Table-related KPIs
    expect(await screen.findByText(/IPv4 Unicast Table Compliance/i)).toBeInTheDocument()
  })

  it('should persist tab selection in localStorage', async () => {
    // Clear localStorage before test
    localStorage.clear()

    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })

    // Mock sub-tab KPIs structure
    const subTabKpis = {
      System: ['switchMemoryUtilization'],
      Table: ['switchIpv4UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Initially localStorage should be empty
    expect(localStorage.getItem('health-infrastructure-kpi-content-switcher')).toBeFalsy()

    // Click on Table tab
    const tableTab = screen.getByText('Table')
    await userEvent.click(tableTab)

    // Verify localStorage now contains the selection
    expect(localStorage.getItem('health-infrastructure-kpi-content-switcher')).toBe('Table')
  })

  it('should switch between sub-tabs and show correct KPIs', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    const subTabKpis = {
      System: ['switchMemoryUtilization', 'switchCpuUtilization'],
      Table: ['switchIpv4UnicastUtilization', 'switchIpv6UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Initially System tab should be active
    expect(await screen.findByText(/Memory Compliance/i)).toBeInTheDocument()

    // Click on Table tab
    const tableTab = await screen.findByText('Table')
    await userEvent.click(tableTab)

    // Should show first KPI from Table tab
    expect(await screen.findByText(/IPv4 Unicast/i)).toBeInTheDocument()
    expect(screen.queryByText(/Memory Compliance/i)).not.toBeInTheDocument()
  })

  it('should show "View more" button for sub-tabs and expand on click', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    const subTabKpis = {
      System: ['switchMemoryUtilization', 'switchCpuUtilization', 'switchesTemperature'],
      Table: ['switchIpv4UnicastUtilization', 'switchIpv6UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Initially only first KPI should be shown
    expect(await screen.findByText(/Memory Compliance/i)).toBeInTheDocument()
    expect(screen.queryByText(/CPU Compliance/i)).not.toBeInTheDocument()

    // Click "View more" button
    const viewMoreButton = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMoreButton)

    // Should now show all KPIs from System tab
    expect(await screen.findByText(/CPU Compliance/i)).toBeInTheDocument()
    expect(await screen.findByText(/Temperature Compliance/i)).toBeInTheDocument()

    // "View more" button should be hidden
    expect(screen.queryByRole('button', { name: 'View more' })).not.toBeInTheDocument()
  })

  it('should handle multiple sub-tabs with different "View more" states', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    const subTabKpis = {
      System: ['switchMemoryUtilization', 'switchCpuUtilization'],
      Table: [
        'switchIpv4UnicastUtilization',
        'switchIpv6UnicastUtilization',
        'switchIpv4MulticastUtilization'
      ],
      Network: ['switchPortUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // System tab should show "View more" (2 KPIs)
    expect(await screen.findByText(/Memory Compliance/i)).toBeInTheDocument()
    expect(screen.queryByText(/CPU Compliance/i)).not.toBeInTheDocument()

    // Table tab should show "View more" (3 KPIs)
    const tableTab = await screen.findByText('Table')
    await userEvent.click(tableTab)
    expect(await screen.findByText(/IPv4 Unicast/i)).toBeInTheDocument()
    expect(screen.queryByText(/IPv6 Unicast/i)).not.toBeInTheDocument()

    // Network tab should not show "View more" (1 KPI)
    const networkTab = await screen.findByText('Network')
    await userEvent.click(networkTab)
    expect(await screen.findByText(/Port Utilization/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View more' })).not.toBeInTheDocument()
  })

  it('should maintain sub-tab state when switching between tabs', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    const subTabKpis = {
      System: ['switchMemoryUtilization', 'switchCpuUtilization'],
      Table: ['switchIpv4UnicastUtilization', 'switchIpv6UnicastUtilization']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          isSwitch={true}
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Expand System tab
    const viewMoreSystem = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMoreSystem)
    expect(await screen.findByText(/CPU Compliance/i)).toBeInTheDocument()

    // Switch to Table tab
    const tableTab = await screen.findByText('Table')
    await userEvent.click(tableTab)
    expect(await screen.findByText(/IPv4 Unicast/i)).toBeInTheDocument()
    expect(screen.queryByText(/IPv6 Unicast/i)).not.toBeInTheDocument()

    // Switch back to System tab - should still be expanded
    const systemTab = await screen.findByText('System')
    await userEvent.click(systemTab)
    expect(await screen.findByText(/CPU Compliance/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View more' })).not.toBeInTheDocument()
  })

  it('should handle sub-tab KPIs with no histogram config (BarChart rendering)', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: { mutationAllowed: true }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: { saveThreshold: { success: true } }
    })

    // Use KPIs that don't have histogram config (like 'onlineAPs')
    const subTabKpis = {
      Overview: ['onlineAPs', 'connectionSuccess'],
      Performance: ['clientThroughput']
    }

    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection
          kpis={subTabKpis}
          thresholds={defaultThreshold}
          mutationAllowed={true}
          filters={{ ...filters, filter }}
        />
      </HealthPageContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Should render BarChart instead of Histogram for KPIs without histogram config
    expect(await screen.findByText(/Online APs/i)).toBeInTheDocument()

    // Switch to Performance tab
    const performanceTab = await screen.findByText('Performance')
    await userEvent.click(performanceTab)
    expect(await screen.findByText(/Client Throughput/i)).toBeInTheDocument()
  })
})
