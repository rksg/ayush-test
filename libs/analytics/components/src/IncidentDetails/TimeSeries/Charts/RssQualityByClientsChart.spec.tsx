import { BrowserRouter } from 'react-router-dom'

import { fakeIncidentRss, overlapsRollup }  from '@acx-ui/analytics/utils'
import { dataApiURL, store, Provider }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { noBuffer }             from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import {
  RssQualityByClientsChart,
  formatWithPercentageAndCount
} from './RssQualityByClientsChart'

import type { TimeSeriesChartResponse } from '../types'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

const expectedResult = {
  rssQualityByClientsChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z',
      '2022-04-07T10:30:00.000Z'
    ],
    good: [30, 20, 15, 17, 22, null],
    average: [6, 7, 8, 9, 10, null],
    bad: [11, 12, 13, 14, 15, null]
  }
} as unknown as TimeSeriesChartResponse

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('RssQualityByClientsChart', () => {
  it('should render chart', () => {
    const { asFragment } = render(
      <Provider>
        <BrowserRouter>
          <RssQualityByClientsChart
            chartRef={()=>{}}
            buffer={noBuffer}
            incident={fakeIncidentRss}
            data={expectedResult}
          />
        </BrowserRouter>
      </Provider>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should hide chart when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    render(
      <Provider>
        <BrowserRouter>
          <RssQualityByClientsChart
            chartRef={()=>{}}
            buffer={noBuffer}
            incident={fakeIncidentRss}
            data={expectedResult}
          />
        </BrowserRouter>
      </Provider>
    )
    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        buffer: noBuffer,
        incident: fakeIncidentRss,
        charts: [TimeSeriesChartTypes.RssQualityByClientsChart],
        minGranularity: 'PT15M'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })

  describe('formatWithPercentageAndCount', () => {
    const totals = [82, 79, 78, 100]
    const format = formatWithPercentageAndCount
    it('format values', () => {
      expect(format(totals, 7/79, undefined, 1)).toEqual('8.86% (7 clients)')
      expect(format(totals, 1/100, undefined, 3)).toEqual('1% (1 client)')
      expect(format(totals, null, undefined, 1)).toEqual('-- (0 clients)')
    })
  })
})
