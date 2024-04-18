import { fakeIncidentRss, overlapsRollup }  from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { rssDistributionChartApi, Response } from './services'

import { RssDistributionChart } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

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
  beforeEach(() => store.dispatch(rssDistributionChartApi.util.resetApiState()))

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

  it('should hide chart when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'RssDistribution', { data: response })
    render(
      <Provider>
        <RssDistributionChart incident={fakeIncidentRss} />
      </Provider>
    )
    await screen.findByText('RSS Distribution')
    await screen.findByText('Data granularity at this level is not available.')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
