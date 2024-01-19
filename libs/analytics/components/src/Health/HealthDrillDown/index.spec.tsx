import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'
import { DateRange }                        from '@acx-ui/utils'

import { mockConnectionDrillDown, mockTtcDrillDown } from './__tests__/fixtures'
import { api }                                       from './services'
import { Point }                                     from './styledComponents'

import { HealthDrillDown } from '.'

jest.mock('./healthPieChart', () => ({
  HealthPieChart: () => <div>PIE chart</div>
}))

jest.mock('./impactedClientTable', () => ({
  ...jest.requireActual('./impactedClientTable'),
  ImpactedClientsTable: () => <div data-testid='impactedClientsTable' />
}))

describe('HealthDrillDown', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  } as AnalyticsFilter
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
          setDrilldownSelection={() => {}}
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render connection failure funnel chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
          setDrilldownSelection={() => {}}
        />
      </Provider>
    )
    expect(await screen.findByText('Connection Failures')).toBeVisible()
  })
  it('should render Average Time To Connect chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TTCDrilldown', { data: mockTtcDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='ttc'
          setDrilldownSelection={() => {}}
        />
      </Provider>
    )
    expect(await screen.findByText('Average Time To Connect')).toBeVisible()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', {
      error: new Error('something went wrong!')
    })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
          setDrilldownSelection={() => {}}
        />
      </Provider>
    )
    await screen.findByText('Something went wrong.')
  })
  it('should render pie chart and table', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
          setDrilldownSelection={() => {}}
        />
      </Provider>
    )
    await userEvent.click(await screen.findByRole('Association'))
    expect(await screen.findByText('PIE chart')).toBeVisible()
  })
  it('should close on close icon click', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    const mockSetDrilldownSelection = jest.fn()
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
          setDrilldownSelection={mockSetDrilldownSelection}
        />
      </Provider>
    )
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(mockSetDrilldownSelection).toBeCalled()
    jest.resetAllMocks()
  })

  describe('Point', () => {
    it('should render on null xPos', () => {
      render(<Point $xPos={null} data-testId='point'/>)
      const point = screen.getByTestId('point')
      expect(point).toHaveStyle('left: 50%;')
    })
  })
})


