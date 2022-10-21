import { useIntl } from 'react-intl'

import { dataApiURL }                                   from '@acx-ui/analytics/services'
import { AnalyticsFilter }                              from '@acx-ui/analytics/utils'
import { Provider, store }                              from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, renderHook } from '@acx-ui/test-utils'
import { DateRange }                                    from '@acx-ui/utils'

import { timeseriesApi } from '../../pages/Health/Kpi/services'

import { connectionSuccessFixture, clientThroughputFixture } from './__tests__/fixtures'

import { KpiWidget, getKpiInfoText } from './index'

describe('KpiWidget', () => {
  const percentDivSelector = 'div > div:nth-child(2) > div > div'
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }

  beforeEach(() =>
    store.dispatch(timeseriesApi.util.resetApiState())
  )

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { data: connectionSuccessFixture } }
    })
    render( <Provider> <KpiWidget name='connectionSuccess' filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Connection Success')
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { data: [null, null] } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='timeToConnect' filters={filters}/></Provider>)
    await screen.findByText('Time To Connect')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
    expect(asFragment().querySelector('svg')).toMatchSnapshot('svg')
  })
  it('should render component properly with sparkline', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { data: connectionSuccessFixture } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='connectionSuccess' filters={filters}/></Provider>)
    await screen.findByText('Connection Success')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
    expect(asFragment().querySelector('svg')).toMatchSnapshot('svg')
  })

  it('should render component having healthy icon', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { data: clientThroughputFixture } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='clientThroughput' filters={filters}/></Provider>)
    await screen.findByText('Client Throughput')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
    expect(asFragment().querySelector('svg')).toMatchSnapshot('svg')
  })
  it('should render component having major icon', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { data: [
        [1,3],
        [1,3]
      ] } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='clientThroughput' filters={filters}/></Provider>)
    await screen.findByText('Client Throughput')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
    expect(asFragment().querySelector('svg')).toMatchSnapshot('svg')
  })
  it('should return proper Kpi info text',()=>{
    const { result } = renderHook(() => getKpiInfoText(12345,23456, 10000 , useIntl()))
    expect(result).toMatchSnapshot()
  })
})