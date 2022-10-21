import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { api } from './services'

import TrafficByVolumeWidget from '.'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  totalTraffic_all: [1, 2, 3, 4, 5],
  totalTraffic_6: [6, 7, 8, 9, 10],
  totalTraffic_5: [11, 12, 13, 14, 15],
  totalTraffic_24: [16, 17, 18, 19, 20]
}

const sampleNoData = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  totalTraffic_all: [null],
  totalTraffic_6: [null],
  totalTraffic_5: [null],
  totalTraffic_24: [null]
}

describe('TrafficByVolumeWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }
  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render(<Provider> <TrafficByVolumeWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } =render(<Provider> <TrafficByVolumeWidget filters={filters}/></Provider>)
    await screen.findByText('Traffic by Volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
      error: new Error('something went wrong!')
    })
    render(<Provider> <TrafficByVolumeWidget filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sampleNoData } } }
    })
    render( <Provider> <TrafficByVolumeWidget filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
