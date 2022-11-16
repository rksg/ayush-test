import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { fakeIncidentContReboot }           from '@acx-ui/analytics/utils'
import { store }                            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { buffer6hr }               from '../__tests__/fixtures'
import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { ConnectedClientsChart } from './ConnectedClientsChart'

const expectedResult = {
  clientCountCharts: {
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
    connectedClientCount: [0, 1, 1, 1, 0, 1, 1, 0, 1]
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('ConnectedClientsChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <ConnectedClientsChart
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
      clientCountCharts: {
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
        connectedClientCount: [null, null, null, null, null, null, null, null, null]
      }
    }
    const { asFragment } = render(
      <BrowserRouter>
        <ConnectedClientsChart
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
describe('connectedClientsChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentContReboot,
        charts: [TimeSeriesChartTypes.ConnectedClientsChart],
        minGranularity: 'PT180S',
        buffer: buffer6hr
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

