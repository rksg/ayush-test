import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'

import { dataApiURL }                      from '@acx-ui/analytics/services'
import { Provider, store }                 from '@acx-ui/store'
import { mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'

import { api, TrafficByVolumeData } from './services'

import TrafficByVolumeWidget, { getSeriesData } from '.'

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

describe('TrafficByVolumeWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'widget_trafficByVolume', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render( <Provider> <TrafficByVolumeWidget/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'widget_trafficByVolume', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } =render( <Provider> <TrafficByVolumeWidget/></Provider>)
    await screen.findByText('Traffic by Volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'widget_trafficByVolume', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <TrafficByVolumeWidget/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})

describe('getSeriesData', ()=>{
  it('should return correct format', ()=>{
    expect(getSeriesData(sample as unknown as TrafficByVolumeData))
      .toEqual([
        {
          name: 'All Radios',
          data: sample.time.map((t,index)=>[t, 1+index])
        },
        {
          name: '2.4 GHz',
          data: sample.time.map((t,index)=>[t, 16+index])
        },
        {
          name: '5 GHz',
          data: sample.time.map((t,index)=>[t, 11+index])
        },
        {
          name: '6 GHz',
          data: sample.time.map((t,index)=>[t, 6+index])
        }
      ])
  })
  it('should return empty array if no data', ()=>{
    expect(getSeriesData())
      .toEqual([])
  })
})
