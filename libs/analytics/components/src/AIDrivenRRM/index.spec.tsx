import { defaultNetworkPath }                 from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { NetworkPath, PathFilter, DateRange } from '@acx-ui/utils'

import { crrmListResult } from '../Recommendations/__tests__/fixtures'
import { api }            from '../Recommendations/services'

import { AIDrivenRRM } from '.'

const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('AIDrivenRRM dashboard', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: crrmListResult
    })
    render(<AIDrivenRRM pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    expect(await screen.findByText('zone-1')).toBeVisible()
    expect(await screen.findByText('zone-2')).toBeVisible()
    expect(await screen.findByText('Deeps Place')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are 3 recommendations for 3 zones covering 13.9K possible RRM combinations. Currently, 1 zone is optimized.')).toBeVisible()
  })

  it('renders no data for switch path', async () => {
    const switchPathFilters = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'switchGroup', name: 'sg1' }
      ] as NetworkPath
    }
    render(<AIDrivenRRM pathFilters={switchPathFilters} />, {
      route: true,
      wrapper: Provider
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI has confirmed that all zones are currently operating with the optimal RRM configurations and no further recommendation is required.')).toBeVisible()
    expect(await screen.findByText('No recommendations')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: {
        crrmCount: 0,
        zoneCount: 0,
        optimizedZoneCount: 0,
        crrmScenarios: 0,
        recommendations: []
      }
    })
    render(<AIDrivenRRM pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI has confirmed that all zones are currently operating with the optimal RRM configurations and no further recommendation is required.')).toBeVisible()
    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
