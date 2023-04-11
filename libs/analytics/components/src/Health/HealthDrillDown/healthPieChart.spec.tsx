import { AnalyticsFilter }                                                                 from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                                                     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, fireEvent, cleanup } from '@acx-ui/test-utils'
import { DateRange }                                                                       from '@acx-ui/utils'

import { mockConnectionFailureResponse, mockTtcResponse, mockPathWithAp, mockOnlyWlansResponse } from './__tests__/fixtures'
import { HealthPieChart, pieNodeMap }                                                            from './healthPieChart'
import { api }                                                                                   from './services'



describe('HealthPieChart', () => {

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const filters: AnalyticsFilter = {
    startDate: '01-03-2023',
    endDate: '02-03-2023',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }]
  }

  it('should render correctly for many connectionFailures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            filters={filters}
            queryType='connectionFailure'
            queryFilter='Authentication' />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })

  it('should render correctly for single ttc failures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTtcResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart filters={filters} queryType='ttc' queryFilter='Authentication' />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })

  it('should render correctly for missing nodes data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockOnlyWlansResponse })
    const apFilters = { ...filters, path: mockPathWithAp }
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart filters={apFilters} queryType='ttc' queryFilter='Authentication' />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })

  it('should handle chart switching', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            filters={filters}
            queryType='connectionFailure'
            queryFilter='Authentication' />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Authentication')).toBeVisible()
    expect(await screen.findByText('Top 5 Impacted WLANs')).toBeVisible()
    const venues = await screen.findByText('Venues')
    fireEvent.click(venues)
    expect(await screen.findByText('Top 5 Impacted Venues')).toBeVisible()
  })

  describe('pieNodeMap', () => {
    it('should return correct venue title', () => {
      const group = pieNodeMap([{ type: 'zone', name: 'Zone' }])
      expect(group).toMatch('AP Group')

      const ap = pieNodeMap([{ type: 'ap', name: 'AP' }])
      expect(ap).toMatch('AP')
    })
  })
})

