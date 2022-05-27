import { render, screen } from '@testing-library/react'

import { trafficByVolumeWidgetApi } from '@acx-ui/analytics/services'
import { dataApiURL }               from '@acx-ui/analytics/utils'
import { Provider, store }          from '@acx-ui/store'

import { mockRTKQuery } from '../../../setupServer'

import TrafficByVolumeWidget, { getSeriesData, TrafficByVolumeData } from './index'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  traffic_all: [1, 2, 3, 4, 5],
  traffic_6: [6, 7, 8, 9, 10],
  traffic_5: [11, 12, 13, 14, 15],
  traffic_24: [16, 17, 18, 19, 20]
}

describe('TrafficByVolumeWidget', () => {
  beforeEach(() =>
    store.dispatch(trafficByVolumeWidgetApi.util.resetApiState())
  )
  it('should render correctly', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: sample
        }
      }
    }
    mockRTKQuery(dataApiURL, 'widget_trafficByVolume', {
      data: expectedResult
    })
    const { asFragment } = render(
      <Provider>
        <TrafficByVolumeWidget/>
      </Provider>
    )
    await screen.findByTestId('loading')
    await screen.findByTestId('card')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render error', async () => {
    mockRTKQuery(dataApiURL, 'widget_trafficByVolume', {
      error: new Error('something went wrong!')
    })
    render(
      <Provider>
        <TrafficByVolumeWidget/>
      </Provider>
    )
    await screen.findByTestId('loading')
    await screen.findByTestId('error')
  })
})

describe('getSeriesData', ()=>{
  it('should return correct format', ()=>{
    const result = getSeriesData(sample as unknown as TrafficByVolumeData)
    expect(result).toEqual([
      {
        name: 'ALL',
        data: sample.time.map((t,index)=>[t, 1+index])
      },
      {
        name: '6 GHz',
        data: sample.time.map((t,index)=>[t, 6+index])
      },
      {
        name: '5 GHz',
        data: sample.time.map((t,index)=>[t, 11+index])
      },
      {
        name: '2.4 GHz',
        data: sample.time.map((t,index)=>[t, 16+index])
      }
    ])
  })
})