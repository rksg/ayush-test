import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                                     from '@acx-ui/analytics/services'
import { fakeIncidentDowntimeHigh }                       from '@acx-ui/analytics/utils'
import { store }                                          from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { buffer6hr }               from '../__tests__/fixtures'
import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { DowntimeEventTypeDistributionChart } from './DowntimeEventTypeDistributionChart'

const expectedResult = {
  downtimeEventTypeDistributionChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    apDisconnectionEvents: {
      apHeartbeatLost: [1, 2, 3, 4, 5],
      apRebootBySystem: [6, 7, 8, 9, 10],
      apConnectionLost: [11, 12, 13, 14, 15],
      apRebootByUser: [16, 17, 18, 19, 20]
    }
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('TtcByFailureTypeChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <DowntimeEventTypeDistributionChart
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
  it('handle when data is null', () => {
    const noDataResult = {
      downtimeEventTypeDistributionChart: {
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ],
        apDisconnectionEvents: {
          apHeartbeatLost: [null, null, null, null, null],
          apRebootBySystem: [null, null, null, null, null],
          apConnectionLost: [null, null, null, null, null],
          apRebootByUser: [null, null, null, null, null]
        }
      }
    }
    const { asFragment } = render(
      <BrowserRouter>
        <DowntimeEventTypeDistributionChart
          chartRef={()=>{}}
          incident={fakeIncidentDowntimeHigh}
          data={noDataResult}
          buffer={buffer6hr}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
    expect(screen.getByText('No data to display')).toBeVisible()
  })
})
describe('downtimeEventTypeDistributionChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncidentDowntimeHigh,
        charts: [TimeSeriesChartTypes.DowntimeEventTypeDistributionChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
