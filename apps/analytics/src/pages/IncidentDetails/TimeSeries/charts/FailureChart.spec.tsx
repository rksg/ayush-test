import { BrowserRouter } from 'react-router-dom'

import { dataApiURL } from '@acx-ui/analytics/services'
import {
  fakeIncident1,
  fakeIncident
} from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { FailureChart } from './FailureChart'

import type { TimeSeriesChartResponse } from '../types'

const expectedResult = {
  failureChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    eap: [1, 1]
  },
  relatedIncidents: [
    fakeIncident({
      id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
      severity: 0.5,
      code: 'eap-failure',
      startTime: '2022-07-19T05:15:00.000Z',
      endTime: '2022-07-20T02:42:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    }),
    fakeIncident({
      id: '07965e24-84ba-48a5-8200-f310f8197f41',
      severity: 0.8,
      code: 'eap-failure',
      startTime: '2022-04-08T12:15:00.000Z',
      endTime: '2022-04-08T13:15:00.000Z',
      path: [{ type: 'zone', name: 'Zone' }]
    })
  ]
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('FailureChart', () => {
  mockDOMWidth()

  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <FailureChart chartRef={()=>{}} incident={fakeIncident1} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('failureChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    })
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncident1,
        charts: [TimeSeriesChartTypes.FailureChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

