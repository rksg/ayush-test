import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                           from '@acx-ui/analytics/services'
import { fakeIncidentContReboot, fakeIncident } from '@acx-ui/analytics/utils'
import { store }                                from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }     from '@acx-ui/test-utils'

import { buffer6hr }               from '../__tests__/fixtures'
import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { ApRebootBySystemChart } from './ApRebootBySystemChart'

const expectedResult = {
  apRebootBySystem: {
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
    apRebootBySystem: [0, 1, 1, 1, 0, 1, 1, 0, 1]
  },
  relatedIncidents: [
    fakeIncident({
      id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
      severity: 0.5,
      code: fakeIncidentContReboot.code,
      startTime: '2022-07-19T05:15:00.000Z',
      endTime: '2022-07-20T02:42:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    }),
    fakeIncident({
      id: '07965e24-84ba-48a5-8200-f310f8197f41',
      severity: 0.8,
      code: fakeIncidentContReboot.code,
      startTime: '2022-04-08T12:15:00.000Z',
      endTime: '2022-04-08T13:15:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    })
  ]
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('ApRebootBySystemChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <ApRebootBySystemChart
          chartRef={()=>{}}
          incident={fakeIncidentContReboot}
          data={expectedResult}
          buffer={buffer6hr}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('handle when data is null', () => {
    const noDataResult = {
      apRebootBySystem: {
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-08T09:30:00.000Z'
        ],
        apDisconnectionCount: [null, null]
      }
    }
    const { asFragment } = render(
      <BrowserRouter>
        <ApRebootBySystemChart
          chartRef={()=>{}}
          incident={fakeIncidentContReboot}
          data={noDataResult}
          buffer={buffer6hr}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
    expect(screen.getByText('No data to display')).toBeVisible()
  })
})
describe('apRebootBySystemQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentContReboot,
        charts: [TimeSeriesChartTypes.ApRebootBySystemChart],
        minGranularity: 'PT180S',
        buffer: buffer6hr
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

