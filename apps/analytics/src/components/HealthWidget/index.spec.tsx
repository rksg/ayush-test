/* eslint-disable testing-library/no-node-access */
import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { healthWidgetFixture } from './__tests__/fixtures'
import { api }                 from './services'

import HealthWidget from './index'

describe('HealthWidget', () => {
  let params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: healthWidgetFixture } }
    })
    render( <Provider> <HealthWidget filters={filters}/></Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: {
        health: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <HealthWidget filters={filters}/>
    </Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    await screen.findByText('Top 5 Venues/Services with poor experience')
    expect(asFragment()).toMatchSnapshot('NoData')
  })

  it('should render widget with proper data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthWidget', {
      data: { network: { hierarchyNode: healthWidgetFixture } }
    })
    const { asFragment } = render( <Provider> <HealthWidget
      filters={filters}/></Provider>, {
      route: { params, path: '/:tenantId/venues' }
    })
    await screen.findByText('Top 5 Venues/Services with poor experience')
    expect(asFragment()).toMatchSnapshot()
  })
})
