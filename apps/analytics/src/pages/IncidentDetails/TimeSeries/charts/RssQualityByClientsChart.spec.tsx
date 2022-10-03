import { BrowserRouter } from 'react-router-dom'

import { store }                from '@acx-ui/store'
import { mockDOMWidth, render } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { RssQualityByClientsChart } from './RssQualityByClientsChart'

const expectedResult = {
  rssQualityByClientsChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    good: [30, 20, 15, 17, 22],
    average: [6, 7, 8, 9, 10],
    bad: [11, 12, 13, 14, 15]
  }
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('RssQualityByClientsChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <RssQualityByClientsChart data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
