import { pathToFilter }                                                                    from '@acx-ui/analytics/utils'
import { get }                                                                             from '@acx-ui/config'
import { formatter }                                                                       from '@acx-ui/formatter'
import { dataApiURL, Provider, store }                                                     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, fireEvent, cleanup } from '@acx-ui/test-utils'
import { DateRange }                                                                       from '@acx-ui/utils'
import type { AnalyticsFilter }                                                            from '@acx-ui/utils'

import { mockConnectionFailureResponse, mockTtcResponse, mockPathWithAp, mockOnlyWlansResponse } from './__tests__/fixtures'
import { HealthPieChart, pieNodeMap, tooltipFormatter }                                          from './healthPieChart'
import { api }                                                                                   from './services'

const mockGet = get as jest.Mock

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  defineMessage: jest.fn(message => message)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
describe('HealthPieChart', () => {

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const filters: AnalyticsFilter = {
    startDate: '01-03-2023',
    endDate: '02-03-2023',
    range: DateRange.last24Hours,
    filter: {}
  }

  it('should render correctly for many connectionFailures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            filters={filters}
            queryType='connectionFailure'
            selectedStage='Authentication'
            valueFormatter={formatter('durationFormat')}
          />,
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
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(fragment).toMatchSnapshot()
  })

  it('should render correctly for single ttc failures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTtcResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            filters={filters}
            queryType='ttc'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
          />,
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
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(fragment).toMatchSnapshot()
  })

  it('should render correctly for missing nodes data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockOnlyWlansResponse })
    const apFilters = { ...filters, path: mockPathWithAp }
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            filters={apFilters}
            queryType='ttc'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
          />,
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
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
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
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
          />,
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
    expect(await screen.findByText('5 Impacted Venues')).toBeVisible()
  })

  describe('tooltipFormatter', () => {
    it('returns formatted values and percentage', () => {
      expect(tooltipFormatter(50, formatter('durationFormat'))(25)).toEqual('50%(25 ms)')
    })
  })
  describe('pieNodeMap', () => {
    it('should return correct venue title', () => {
      const zone = pieNodeMap(pathToFilter([
        { type: 'zone', name: 'Zone' }
      ]))
      expect(zone.defaultMessage?.[0].options.one.value[0].value).toEqual('AP Group')
      const ap = pieNodeMap(pathToFilter([
        { type: 'zone', name: 'Zone' },
        { type: 'AP', name: 'AP' }
      ]))
      expect(ap.defaultMessage?.[0].options.one.value[0].value).toEqual('AP')
    })

    it('should return correct title for ACX', () => {
      mockGet.mockReturnValue(undefined)
      const venue = pieNodeMap(pathToFilter([]))
      expect(venue.defaultMessage?.[0].options.one.value[0].value).toEqual('Venue')
    })
    it('should return correct title for RA', () => {
      mockGet.mockReturnValue('true')
      const venue = pieNodeMap(pathToFilter([]))
      expect(venue.defaultMessage?.[0].options.one.value[0].value).toEqual('Zone')
    })
  })
})

