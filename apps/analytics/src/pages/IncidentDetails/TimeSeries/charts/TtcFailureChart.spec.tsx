import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }         from '@acx-ui/analytics/services'
import { fakeIncidentTtc }    from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  screen,
  mockDOMWidth,
  mockGraphqlQuery,
  render,
  waitForElementToBeRemoved
}                             from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { buffer6hr }                     from './__tests__/fixtures'
import { TtcFailureChart, aggregateTtc } from './TtcFailureChart'

import type { TimeSeriesChartResponse } from '../types'

const time = [
  '2022-04-07T09:15:00.000Z',
  '2022-04-07T09:30:00.000Z',
  '2022-04-07T09:45:00.000Z',
  '2022-04-07T10:00:00.000Z',
  '2022-04-07T10:15:00.000Z'
]
const ttc = [1, 2, 3, 4, null]
const ttcCounts = [[1, 1], [1, 2], [1, 3], [1, 4], null] as [number, number][]
const expectedResult = {
  ttcFailureChart: { time, ttc }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('aggregateTtc', () => {
  it('should return correct data',() => {
    expect(aggregateTtc(time, ttc, ttcCounts)).toEqual({
      time,
      ttc,
      slowConnections: [0, 1, 2, 3, null],
      totalConnections: [1, 2, 3, 4, null]
    })
  })
})

describe('TtcFailureChart', () => {
  mockDOMWidth()
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: { time, data: ttcCounts } }
    })
    const { asFragment } = render(
      <Provider>
        <BrowserRouter>
          <TtcFailureChart
            chartRef={()=>{}}
            buffer={buffer6hr}
            incident={fakeIncidentTtc}
            data={expectedResult}

          />
        </BrowserRouter>
      </Provider>
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loader/ }))
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('ttcFailureChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncidentTtc,
        charts: [TimeSeriesChartTypes.TtcFailureChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
