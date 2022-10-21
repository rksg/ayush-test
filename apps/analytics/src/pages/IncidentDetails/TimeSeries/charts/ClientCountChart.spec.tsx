import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                                     from '@acx-ui/analytics/services'
import { fakeIncident1 }                                  from '@acx-ui/analytics/utils'
import { store }                                          from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { buffer6hr }            from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { ClientCountChart } from './ClientCountChart'

import type { TimeSeriesChartResponse } from '../types'

const expectedResult = {
  clientCountChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    newClientCount: [1, 2, 3, 4, 5],
    impactedClientCount: [6, 7, 8, 9, 10],
    connectedClientCount: [11, 12, 13, 14, 15]
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('ClientCountChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <ClientCountChart
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
  it('handle when data is null', () => {
    const noDataResult = {
      clientCountChart: {
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ],
        newClientCount: [null, null, null, null, null],
        impactedClientCount: [null, null, null, null, null],
        connectedClientCount: [null, null, null, null, null]
      }
    }
    const { asFragment } = render(
      <BrowserRouter>
        <ClientCountChart
          chartRef={()=>{}}
          incident={fakeIncident1}
          data={noDataResult}
          buffer={buffer6hr}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
    expect(screen.getByText('No data to display')).toBeVisible()
  })
})
describe('clientCountChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: buffer6hr,
        incident: fakeIncident1,
        charts: [TimeSeriesChartTypes.ClientCountChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
