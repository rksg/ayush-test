import userEvent from '@testing-library/user-event'

import { healthApi }                     from '@acx-ui/analytics/services'
import { AnalyticsFilter, pathToFilter } from '@acx-ui/analytics/utils'
import { BrowserRouter as Router }       from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store }   from '@acx-ui/store'
import {
  cleanup,
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { TimeStampRange }                                            from '@acx-ui/types'
import { DateRange, NetworkPath, fixedEncodeURIComponent, NodeType } from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import KpiSection from '.'

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
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: false
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        timeToConnect: {
          success: true
        }
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
    const loaders = await screen.findAllByRole('img', { name: 'loader' })
    expect(loaders.length).toBeGreaterThanOrEqual(1)
  })

  it('should render disabled tooltip with no permissions', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: false
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        saveThreshold: {
          success: true
        }
      }
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
        <KpiSection tab={'overview'} filters={{ ...filters, filter }} />
      </HealthPageContext.Provider>
    </Provider>, {
      route: {
        // eslint-disable-next-line max-len
        path: `/tenantId/analytics/health?period=${period}&analyticsNetworkFilter=${analyticsNetworkFilter}`,
        wrapRoutes: false
      }
    })
    const button = await screen.findByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(button.parentElement!)
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You don\'t have permission to set threshold for selected network node.')).toBeInTheDocument()
  }, 60000)

  it('should render valid threshold apply for single ap path', async () => {
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: true
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })

    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
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
        <KpiSection tab={'overview'} filters={{ ...filters, filter }} />
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
    const buttons = await screen.findAllByRole('button', { name: 'Apply' })
    expect(buttons).toHaveLength(4)
    expect(buttons[0]).not.toBeDisabled()
  }, 60000)

  it('should render with smaller timewindow', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: false
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        timeToConnect: {
          success: true
        }
      }
    })
    const path = [{ type: 'network', name: 'Network' }] as NetworkPath
    const filter = pathToFilter(path)
    render(<Router><Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext, filter }}
      >
        <KpiSection tab={'overview'}
          filters={{ ...filters, filter, endDate: sampleTS.data[2] as unknown as string }}
        />
      </HealthPageContext.Provider>
    </Provider></Router>)

    expect(await screen.findByText(/Time to Connect/i)).toBeInTheDocument()
  })
})
