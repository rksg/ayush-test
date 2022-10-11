import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { HealthPageContext, TimeWindow } from '../HealthPageContext'

import { timeseriesApi, histogramApi } from './services'

import KpiSection from '.'


describe('Kpi Section', () => {
  beforeEach(() => {
    store.dispatch(histogramApi.util.resetApiState())
    store.dispatch(timeseriesApi.util.resetApiState())
  })
  const sampleTS = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [null, [null, null], [0, 0], [4, 5], [4, 5]]
  }
  const filters = {
    startDate: '2022-04-07T09:15:00.000Z',
    endDate: '2022-04-07T10:15:00.000Z',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  } as AnalyticsFilter
  const healthContext = {
    ...filters,
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'] as TimeWindow,
    setTimeWindow: jest.fn()
  }
  it('should render kpis for tab', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider>)
    await screen.findByText('Time to Connect')
    expect(screen.getByText('20% meets goal')).toBeVisible()
  })
})
