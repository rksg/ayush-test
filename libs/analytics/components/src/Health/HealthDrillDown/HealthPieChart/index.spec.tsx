import { AnalyticsFilter }                                             from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange }                                                   from '@acx-ui/utils'

import { mockConnectionFailureResponse, mockTtcResponse, mockPathWithAp, mockOnlyWlansResponse } from './__tests__/fixtures'
import { api }                                                                                   from './services'

import { HealthPieChart, pieNodeMap } from '.'


describe('HealthPieChart', () => {
  afterEach(() => store.dispatch(api.util.resetApiState()))

  const filters: AnalyticsFilter = {
    startDate: '01-03-2023',
    endDate: '02-03-2023',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }]
  }

  it('should render correctly for many connectionFailures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { asFragment } = render(
      <div style={{ height: 200, width: 200 }}>
        <HealthPieChart filters={filters} queryType='connectionFailure' queryFilter='auth' />,
      </div>,
      {
        wrapper: Provider,
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
      <div style={{ height: 200, width: 200 }}>
        <HealthPieChart filters={filters} queryType='ttc' queryFilter='auth' />,
      </div>,
      {
        wrapper: Provider,
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
      <div style={{ height: 200, width: 200 }}>
        <HealthPieChart filters={apFilters} queryType='ttc' queryFilter='auth' />,
      </div>,
      {
        wrapper: Provider,
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

  describe('pieNodeMap', () => {
    it('should return correct venue title', () => {
      const group = pieNodeMap([{ type: 'zone', name: 'Zone' }])
      expect(group).toMatch('AP Group')

      const ap = pieNodeMap([{ type: 'ap', name: 'AP' }])
      expect(ap).toMatch('AP')
    })
  })
})

