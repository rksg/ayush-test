import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }               from '@acx-ui/analytics/services'
import { fakeIncident1 }            from '@acx-ui/analytics/utils'
import { store }                    from '@acx-ui/store'
import { mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { buffer6hr }            from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { AttemptAndFailureChart } from './AttemptAndFailureChart'

import type { TimeSeriesChartResponse } from '../types'

const expectedResult = {
  attemptAndFailureChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z'
    ],
    failureCount: [1, 2],
    totalFailureCount: [1, 2],
    attemptCount: [1, 2]
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('AttemptAndFailureChart', () => {
  it('should render chart', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AttemptAndFailureChart
          chartRef={()=>{}}
          buffer={buffer6hr}
          incident={fakeIncident1}
          data={expectedResult}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('attemptAndFailureChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncident1,
        charts: [TimeSeriesChartTypes.AttemptAndFailureChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
