import '@testing-library/jest-dom'

import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { api } from './services'

import { TrafficByBand } from './index'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  userTraffic: [1, 2, 3, 4, 5],
  userTraffic_2_4: [6, 7, 8, 9, 10],
  userTraffic_5: [11, 12, 13, 14, 15],
  userTraffic_6: [11, 12, 13, 14, 15]
}

const sampleNoData = {
  time: [
    '2022-12-12T09:45:00.000Z',
    '2022-12-12T10:00:00.000Z'
  ],
  userTraffic: [null],
  userTraffic_2_4: [null],
  userTraffic_5: [null],
  userTraffic_6: [null]
}

describe('TrafficByBandWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {},
    mac: 'client-mac'
  }
  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      data: { client: { timeSeries: sample } }
    })
    render(<Provider> <TrafficByBand filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      data: { client: { timeSeries: sample } }
    })
    const { asFragment } =render(<Provider> <TrafficByBand filters={filters}/></Provider>)
    await screen.findByText('Traffic by Band')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      error: new Error('something went wrong!')
    })
    render(<Provider> <TrafficByBand filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      data: { client: { timeSeries: sampleNoData } }
    })
    render( <Provider> <TrafficByBand filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
