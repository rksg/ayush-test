import { unitOfTime }    from 'moment-timezone'
import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncidentRss }                        from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { RssQualityByClientsChart } from './RssQualityByClientsChart'

import type { TimeSeriesChartResponse } from '../types'

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
} as unknown as TimeSeriesChartResponse

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('RssQualityByClientsChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <RssQualityByClientsChart
          chartRef={()=>{}}
          incident={fakeIncidentRss}
          data={expectedResult}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const buffer = {
      front: { value: 0, unit: 'hours' as unitOfTime.Base },
      back: { value: 0, unit: 'hours' as unitOfTime.Base }
    }
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentRss,
        charts: [TimeSeriesChartTypes.RssQualityByClientsChart],
        buffer,
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
