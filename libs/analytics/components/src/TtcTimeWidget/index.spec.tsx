import { AnalyticsFilter, pathToFilter }    from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { numberResult, emptyResult } from './__tests__/fixtures'
import { api }                       from './services'

import { TtcTimeWidget } from './index'

describe('TtcTimeWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    filter: pathToFilter([{ type: 'AP', name: '28:B3:71:28:6C:10' }]),
    range: DateRange.last24Hours
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      data: emptyResult
    })
    render( <Provider> <TtcTimeWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      data: emptyResult
    })
    render( <Provider>
      <TtcTimeWidget filters={filters}/></Provider>)
    await screen.findByText('Time To Connect')
    await screen.findByText('0')
  })

  it('should render for number data', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      data: numberResult
    })
    render( <Provider>
      <TtcTimeWidget filters={filters}/></Provider>)
    await screen.findByText('Time To Connect')
    await screen.findByText('500')
  })

})
