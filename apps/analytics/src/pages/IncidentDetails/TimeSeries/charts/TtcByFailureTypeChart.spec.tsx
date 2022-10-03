import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncident1 }                          from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from '../config'
import { Api, ChartsData }      from '../services'

import { TtcByFailureTypeChart } from './TtcByFailureTypeChart'

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
} as unknown as ChartsData

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('TtcByFailureTypeChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <TtcByFailureTypeChart data={expectedResult}/>
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
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncident1,
        charts: [TimeSeriesChartTypes.TtcByFailureTypeChart]
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
