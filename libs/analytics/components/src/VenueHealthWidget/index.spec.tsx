import { dataApiURL, healthApi }            from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { VenueHealth } from './index'

jest.mock('../KpiWidget', ()=>({
  KpiWidget: ({ name, threshold }:{ name:string, threshold:number | null }) =>
    (<div data-testid='kpiWidget' data-name={name} data-threshold={threshold}>
    Kpi Widget</div>)
}))

describe('Health Widget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }

  beforeEach(() =>
    store.dispatch(healthApi.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: {
          value: 1000
        },
        clientThroughputThreshold: {
          value: 5000
        }
      }
    })
    render( <Provider> <VenueHealth filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render KPI widgets', async () => {
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: {
          value: 1000
        },
        clientThroughputThreshold: {
          value: 5000
        }
      }
    })

    const { asFragment } = render( <Provider> <VenueHealth filters={filters}/></Provider>)
    await screen.findAllByText('Kpi Widget')
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render KPI widgets for empty threshold value', async () => {
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: {
          value: null
        },
        clientThroughputThreshold: {
          value: null
        }
      }
    })

    const { asFragment } = render( <Provider> <VenueHealth filters={filters}/></Provider>)
    await screen.findAllByText('Kpi Widget')
    expect(asFragment()).toMatchSnapshot()
  })
})
