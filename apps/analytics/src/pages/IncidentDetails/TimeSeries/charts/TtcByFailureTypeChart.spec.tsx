import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncidentTtc }                        from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { buffer6hr }             from './__tests__/fixtures'
import { TtcByFailureTypeChart } from './TtcByFailureTypeChart'

import type { TimeSeriesChartResponse } from '../types'

const expectedResult = {
  ttcByFailureTypeChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    ttcByFailureTypes: {
      ttcByEap: [1, 2, 3, 4, 5],
      ttcByDhcp: [6, 7, 8, 9, 10],
      ttcByAuth: [11, 12, 13, 14, 15],
      ttcByAssoc: [16, 17, 18, 19, 20],
      ttcByRadius: [21, 22, 23, 24, 25]
    }
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('TtcByFailureTypeChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <TtcByFailureTypeChart
          chartRef={()=>{}}
          buffer={buffer6hr}
          incident={fakeIncidentTtc}
          data={expectedResult}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('ttcByFailureTypeChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncidentTtc,
        charts: [TimeSeriesChartTypes.TtcByFailureTypeChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
