import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                             from '@acx-ui/analytics/services'
import { fakeIncidentRss }                        from '@acx-ui/analytics/utils'
import { store }                                  from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { RssDistributionChart } from './RssDistributionChart'

const expectedResult = {
  rssDistribution: [
    { rss: -100, count: 5 },
    { rss: -95, count: 8 },
    { rss: -90, count: 13 },
    { rss: -85, count: 12 },
    { rss: -80, count: 18 },
    { rss: -75, count: 29 },
    { rss: -70, count: 23 },
    { rss: -65, count: 25 },
    { rss: -60, count: 15 },
    { rss: -55, count: 11 },
    { rss: -50, count: 6 },
    { rss: -45, count: 4 },
    { rss: -40, count: 2 },
    { rss: -35, count: 1 },
    { rss: -30, count: 0 },
    { rss: -25, count: 0 }
  ]
} as unknown as TimeSeriesChartResponse

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('RssQualityByClientsChart', () => {
  mockDOMWidth()
  it('should render chart', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <RssDistributionChart chartRef={()=>{}} incident={fakeIncidentRss} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
describe('rssDistributionChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentRss,
        charts: [TimeSeriesChartTypes.RssDistributionChart],
        minGranularity: 'PT180S'
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

