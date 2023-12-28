import { useIntl } from 'react-intl'

import { healthApi }                                    from '@acx-ui/analytics/services'
import { dataApiURL, Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, renderHook } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                         from '@acx-ui/utils'
import { DateRange }                                    from '@acx-ui/utils'

import { connectionSuccessFixture,
  clientThroughputFixture,
  clientThroughputHistogramFixture } from './__tests__/fixtures'

import { KpiWidget, getKpiInfoText } from './index'

describe('KpiWidget', () => {
  const percentDivSelector = 'div > div:nth-child(2) > div > div'
  const filters: AnalyticsFilter = {
    startDate: '2023-01-10T12:26:00+05:30',
    endDate: '2023-01-17T12:26:00+05:30',
    range: DateRange.last24Hours,
    filter: {
      networkNodes: [
        [
          {
            type: 'zone',
            name: '70ffc8b0c3f540049379a84c17e5bab3'
          }
        ]
      ] ,
      switchNodes: [
        [
          {
            type: 'switchGroup',
            name: '70ffc8b0c3f540049379a84c17e5bab3'
          }
        ]
      ]
    }
  }

  beforeEach(() =>
    store.dispatch(healthApi.util.resetApiState())
  )

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: connectionSuccessFixture } }
    })
    render( <Provider> <KpiWidget name='connectionSuccess' filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Connection Success')
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [null, null] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: {
        time: [
          '2023-01-11T00:00:00.000Z',
          '2023-01-12T00:00:00.000Z'
        ],
        data: [null, null] } } }
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
      data: { network: { timeSeries: connectionSuccessFixture } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='connectionSuccess' filters={filters}/></Provider>)
    await screen.findByText('Connection Success')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
    expect(asFragment().querySelector('svg')).toMatchSnapshot('svg')
  })

  it('should render component properly with sparkline with no chart style', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: connectionSuccessFixture } }
    })
    render( <Provider>
      <KpiWidget name='connectionSuccess' filters={filters} type='no-chart-style'/></Provider>)
    await screen.findByText('Connection Success')
  })

  it('should render component having healthy icon', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: clientThroughputHistogramFixture } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: clientThroughputFixture } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='clientThroughput' filters={filters}/></Provider>)
    await screen.findByText('Client Throughput')
    expect(asFragment().querySelector(percentDivSelector))
      .toMatchSnapshot('percentDiv')
  })
  it('should render component having major icon', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [
        2,
        0,
        1,
        0,
        0,
        0,
        0
      ] } } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: {
        time: [
          '2023-01-11T00:00:00.000Z',
          '2023-01-12T00:00:00.000Z'
        ],
        data: [
          [1,3],
          [1,3]
        ] } } }
    })
    const { asFragment } =render( <Provider>
      <KpiWidget name='clientThroughput' filters={filters} threshold={25000}/></Provider>)
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
