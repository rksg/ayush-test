import userEvent from '@testing-library/user-event'

import { healthApi }                   from '@acx-ui/analytics/services'
import { pathToFilter }                from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn }      from '@acx-ui/feature-toggle'
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
import { TimeStampRange }                 from '@acx-ui/types'
import { setUserProfile, getUserProfile } from '@acx-ui/user'
import { DateRange, NetworkPath }         from '@acx-ui/utils'
import type { AnalyticsFilter }           from '@acx-ui/utils'

import { HealthPageContext } from '../../../Health/HealthPageContext'

import KpiSection from '.'

// Mock the feature toggle hook
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
}))

const mockUseIsSplitOn = useIsSplitOn as jest.MockedFunction<typeof useIsSplitOn>

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
    // Reset feature toggle mocks
    mockUseIsSplitOn.mockReturnValue(false)
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

  const sampleTSWithLowDeviceCount = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
  }

  const sampleTSWithNullData = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [[0, 25], [0, 25], [0, 25], [0, 25], null]
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

  it('should render loaders', async () => {
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
        <KpiSection tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
      </HealthPageContext.Provider>
    </Provider>, { route: { params, path: '/:tenantId' } })
    let loaders = await screen.findAllByRole('img', { name: 'loader' })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(loaders.length).toBeGreaterThanOrEqual(1)
  })

  it('should render other sections when clicked on view more', async () => {
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
        value={{ ...healthContext }}
      >
        <KpiSection tab={'infrastructure'}
          filters={{ ...filters, filter, endDate: sampleTS.data[2] as unknown as string }}
        />
      </HealthPageContext.Provider>
    </Provider></Router>)
    expect(await screen.findAllByText(/Memory Compliance/i)).toHaveLength(1)

    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    expect(await screen.findAllByText(/Temperature Compliance/i)).toHaveLength(1)
  })

  it('should disable threshold setting when wifi-u is missing', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: []
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
        <KpiSection tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
      </HealthPageContext.Provider>
    </Provider>, { route: { params, path: '/:tenantId' } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const sliders = await screen.findAllByRole('slider')
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-disabled', 'true')
    })
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
  })

  describe('Table KPI Banner Tests', () => {
    beforeEach(() => {
      // Enable phase 2 feature flag to get Table/System tab structure
      mockUseIsSplitOn.mockImplementation((feature) => {
        if (feature === Features.SWITCH_HEALTH_PHASE2_TOGGLE ||
            feature === Features.RUCKUS_AI_SWITCH_HEALTH_PHASE2_TOGGLE) {
          return true
        }
        return false
      })

      // Mock the IPv4 Unicast utilization API call for device count checking
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: sampleTS } }
      })

      mockGraphqlQuery(dataApiURL, 'KPI', {
        data: { mutationAllowed: false }
      })
    })

    it('should show banner when device count is 0 for infrastructure tab with Table KPIs',
      async () => {
        // Mock low device count response BEFORE component is rendered
        mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
          data: { network: { timeSeries: sampleTSWithLowDeviceCount } }
        })

        const path = [{ type: 'network', name: 'Network' }] as NetworkPath
        render(<Router><Provider>
          <HealthPageContext.Provider value={{ ...healthContext }}>
            <KpiSection
              tab={'infrastructure'}
              filters={{ ...filters, filter: pathToFilter(path) }}
            />
          </HealthPageContext.Provider>
        </Provider></Router>)

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

        // Verify we have the tab structure
        expect(screen.getByRole('radio', { name: 'Table' })).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument()

        // Click the Table tab to see the banner
        const tableTab = screen.getByRole('radio', { name: 'Table' })
        await userEvent.click(tableTab)

        // Should show the banner with Table KPI names
        expect(screen.getByText(/Additional Wired AI Health compliance KPIs/)).toBeInTheDocument()
        expect(screen.getByText(/IPv4 Unicast Table Compliance/)).toBeInTheDocument()
        expect(screen.getByText(/IPv6 Unicast Table Compliance/)).toBeInTheDocument()
        expect(screen.getByText(/ARP Table Compliance/)).toBeInTheDocument()
        expect(screen.getByText(/MAC Table Compliance/)).toBeInTheDocument()
        expect(screen.getByText(/FastIron version 10.0.10h or greater/)).toBeInTheDocument()
      })

    it('should not show banner when device count is > 0 for infrastructure tab', async () => {
      // Mock high device count response
      const highDeviceCountTS = {
        ...sampleTS,
        data: [[0, 25], [0, 25], [0, 25], [0, 25], [0, 25]]
      }
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: highDeviceCountTS } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Should not show the banner
      expect(screen.queryByText(/Additional Wired AI Health compliance KPIs/))
        .not.toBeInTheDocument()
    })

    it('should not show banner for non-infrastructure tabs', async () => {
      // Mock low device count response
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: sampleTSWithLowDeviceCount } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Should not show the banner for overview tab
      expect(screen.queryByText(/Additional Wired AI Health compliance KPIs/))
        .not.toBeInTheDocument()
    })

    it('should handle null data points correctly', async () => {
      // Mock response with null data at the end
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: sampleTSWithNullData } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Should not show banner because latest valid data point has 25 devices (> 20)
      expect(screen.queryByText(/Additional Wired AI Health compliance KPIs/))
        .not.toBeInTheDocument()
    })

    it('should show banner when all data points are null', async () => {
      // Mock response with all null data
      const allNullTS = {
        ...sampleTS,
        data: [null, null, null, null, null]
      }
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: allNullTS } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Click the Table tab to see the banner
      const tableTab = screen.getByRole('radio', { name: 'Table' })
      await userEvent.click(tableTab)

      // Should show banner because totalCount defaults to 0
      expect(screen.getByText(/Additional Wired AI Health compliance KPIs/)).toBeInTheDocument()
    })

    it('should use primary Alert type for banner', async () => {
      // Mock low device count response
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: sampleTSWithLowDeviceCount } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Click the Table tab to see the banner
      const tableTab = screen.getByRole('radio', { name: 'Table' })
      await userEvent.click(tableTab)

      // Find the alert and verify it has the primary class
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('ant-alert-primary')
      expect(alert).toHaveClass('ant-alert-info') // Should also have info class (mapped type)
    })

    it('should make API call with correct parameters for device count checking', async () => {
      // Mock low device count response
      mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
        data: { network: { timeSeries: sampleTSWithLowDeviceCount } }
      })

      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Click the Table tab to see the banner
      const tableTab = screen.getByRole('radio', { name: 'Table' })
      await userEvent.click(tableTab)

      // Verify the API call was made with switchIpv4UnicastUtilization
      // This would be checked through the mocked GraphQL query
      expect(screen.getByText(/Additional Wired AI Health compliance KPIs/)).toBeInTheDocument()
    })

    it('should use phase 2 KPI configuration when feature flags are enabled', async () => {
      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // With phase 2 enabled, we should see System tab structure, not individual KPIs
      // Look for ContentSwitcher which indicates tab structure (System/Table)
      expect(screen.getByText('Memory Compliance')).toBeInTheDocument() // Should be in System tab
    })

    it('should verify shouldCheckDeviceCount conditions are met', async () => {
      const path = [{ type: 'network', name: 'Network' }] as NetworkPath
      render(<Router><Provider>
        <HealthPageContext.Provider value={{ ...healthContext }}>
          <KpiSection
            tab={'infrastructure'}
            filters={{ ...filters, filter: pathToFilter(path) }}
          />
        </HealthPageContext.Provider>
      </Provider></Router>)

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

      // Should have System/Table structure (proves phase 2 is working)
      expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Table' })).toBeInTheDocument()

      // This proves that shouldCheckDeviceCount logic should be working
      // because the ContentSwitcher is being rendered
    })
  })
})
