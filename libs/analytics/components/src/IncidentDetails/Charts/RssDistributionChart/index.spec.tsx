import { fakeIncidentRss }                  from '@acx-ui/analytics/utils'
import { get }                              from '@acx-ui/config'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { rssDistributionChartApi, Response } from './services'

import { RssDistributionChart } from '.'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const response = {
  network: {
    hierarchyNode: {
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
    }
  }
} as Response

describe('RssQualityByClientsChart', () => {
  beforeEach(() => {
    store.dispatch(rssDistributionChartApi.util.resetApiState())
    jest.mocked(get).mockReturnValue('32') // get('DRUID_ROLLUP_DAYS')
    const mockDate = new Date('2022-07-21T02:42:00.000Z')
    jest.useFakeTimers('modern').setSystemTime(mockDate)
  })
  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'RssDistribution', { data: response })
    const { asFragment } = render(
      <Provider>
        <RssDistributionChart incident={fakeIncidentRss} />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('RSS Distribution')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
