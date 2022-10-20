import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncidentDowntimeHigh, fakeIncident } from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render }               from '@acx-ui/test-utils'

import { buffer6hr }               from '../__tests__/fixtures'
import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { ApDisconnectionCountChart } from './ApDisconnectionCountChart'

const expectedResult = {
  apDisconnectionCountChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    apDisconnectionCount: [1, 1]
  },
  relatedIncidents: [
    fakeIncident({
      id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
      severity: 0.5,
      code: fakeIncidentDowntimeHigh.code,
      startTime: '2022-07-19T05:15:00.000Z',
      endTime: '2022-07-20T02:42:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    }),
    fakeIncident({
      id: '07965e24-84ba-48a5-8200-f310f8197f41',
      severity: 0.8,
      code: fakeIncidentDowntimeHigh.code,
      startTime: '2022-04-08T12:15:00.000Z',
      endTime: '2022-04-08T13:15:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    })
  ]
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('ApDisconnectionCountChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <ApDisconnectionCountChart
          chartRef={()=>{}}
          buffer={buffer6hr}
          incident={fakeIncidentDowntimeHigh}
          data={expectedResult}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('apDisconnectionCountChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncidentDowntimeHigh,
        charts: [TimeSeriesChartTypes.ApDisconnectionCountChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

