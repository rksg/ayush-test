import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncidentHighReboot }                 from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { RebootedAPsCountChart } from './RebootedAPsCountChart'

const expectedResult = {
  rebootedAPsChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T12:15:00.000Z',
      '2022-04-07T15:15:00.000Z',
      '2022-04-07T18:15:00.000Z',
      '2022-04-07T21:15:00.000Z',
      '2022-04-08T00:15:00.000Z',
      '2022-04-08T03:15:00.000Z',
      '2022-04-08T06:15:00.000Z',
      '2022-04-08T09:15:00.000Z'
    ],
    rebootedApCount: [0, 1, 1, 1, 0, 1, 1, 0, 1]
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('RebootedAPsCountChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <RebootedAPsCountChart
          chartRef={()=>{}}
          incident={fakeIncidentHighReboot}
          data={expectedResult}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('rebootedAPsCountQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentHighReboot,
        charts: [TimeSeriesChartTypes.RebootedApsCountChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

