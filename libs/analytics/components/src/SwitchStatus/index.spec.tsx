import { dataApiURL, Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery }             from '@acx-ui/test-utils'
import type { AnalyticsFilter }                         from '@acx-ui/utils'
import { DateRange, TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

import { SwitchStatusTimeSeries } from './__tests__/fixtures'
import { api }                    from './services'

import { SwitchStatusByTime } from './index'

describe('SwitchStatusByTime', () => {
  const filters: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: { network: { hierarchyNode: SwitchStatusTimeSeries } }
    })
    render(
      <Provider>
        <SwitchStatusByTime filters={filters} />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: {
        network: {
          hierarchyNode: {
            switchTotalDowntime: 0,
            switchTotalUptime: 0,
            timeSeries: {
              isSwitchUp: [],
              time: []
            }
          }
        }
      }
    })
    render(
      <Provider>
        <SwitchStatusByTime filters={filters} />
      </Provider>
    )
    await screen.findByText('No data to display')
  })

  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: { network: { hierarchyNode: SwitchStatusTimeSeries } }
    })
    const { asFragment } = render(
      <Provider>
        <SwitchStatusByTime filters={filters} />
      </Provider>,
      { route: true }
    )
    await screen.findByText('Switch Status')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should render chart and refresh interval', async () => {
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: { network: { hierarchyNode: SwitchStatusTimeSeries } }
    })
    const { asFragment } = render(
      <Provider>
        <SwitchStatusByTime filters={filters}
          refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL} />
      </Provider>,
      { route: true }
    )
    await screen.findByText('Switch Status')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
})
