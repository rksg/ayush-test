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
import { DateRange, NetworkPath } from '@acx-ui/utils'
import type { AnalyticsFilter }   from '@acx-ui/utils'

import KpiSection from '.'

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
      <KpiSection tab={'overview'} filters={{ ...filters, filter: pathToFilter(path) }} />
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
      <KpiSection tab={'overview'}
        filters={{ ...filters, filter, endDate: sampleTS.data[2] as unknown as string }}
      />
    </Provider></Router>)
    expect(await screen.findAllByText(/Time-series chart goes here/i)).toHaveLength(1)

    const viewMore = await screen.findByRole('button', { name: 'View more' })
    await userEvent.click(viewMore)
    expect(await screen.findAllByText(/Time-series chart goes here/i)).toHaveLength(6)
  })
})
