import { dataApiURL, healthApi }   from '@acx-ui/analytics/services'
import { AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider, store }         from '@acx-ui/store'
import {
  cleanup,
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'
import { TimeStampRange }         from '@acx-ui/types'
import { DateRange, NetworkPath } from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import KpiSection from '.'

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
  const filters = {
    startDate: '2022-04-07T09:15:00.000Z',
    endDate: '2022-04-07T10:15:00.000Z',
    path: [{ type: 'ap', name: 'Network' }],
    range: DateRange.last24Hours
  } as AnalyticsFilter
  const healthContext = {
    ...filters,
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'] as TimeStampRange,
    setTimeWindow: jest.fn()
  }

  it('should render disabled tooltip with network path', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
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
    render(<Router><Provider>
      <HealthPageContext.Provider
        value={{ ...healthContext, path }}
      >
        <KpiSection tab={'overview'} filters={{ path } as unknown as AnalyticsFilter} />
      </HealthPageContext.Provider>
    </Provider></Router>)
    // eslint-disable-next-line max-len
    await screen.findAllByTitle(/^Cannot save threshold at organisation level*/)
  }, 60000)

  it('should render disabled tooltip with no permissions', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
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

    const path = [{ type: 'network', name: 'Network' }, { type: 'zoneName', name: 'z1' }]
    const period = Buffer.from(JSON.stringify(filters)).toString('base64')
    const analyticsNetworkFilter = Buffer.from(JSON.stringify({
      path,
      raw: []
    })).toString('base64')

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} filters={{ path } as unknown as AnalyticsFilter} />
      </HealthPageContext.Provider>
    </Provider>, {
      route: {
        // eslint-disable-next-line max-len
        path: `/tenantId/analytics/health?period=${period}&analyticsNetworkFilter=${analyticsNetworkFilter}`,
        wrapRoutes: false
      }
    })
    // eslint-disable-next-line max-len
    await screen.findAllByTitle(/^You don't have permission to set threshold for selected network node./)
  }, 60000)

})
