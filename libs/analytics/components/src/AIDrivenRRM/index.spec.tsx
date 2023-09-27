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
    expect(await screen.findByText('zone-1')).toBeVisible()
    expect(await screen.findByText('From 3 to 0 interfering links')).toBeVisible()
    expect(await screen.findByText('zone-2')).toBeVisible()
    expect(await screen.findByText('Reverted')).toBeVisible()
    expect(await screen.findByText('Deeps Place')).toBeVisible()
    expect(await screen.findByText('2 interfering links can be optimized to 0')).toBeVisible()
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

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: { recommendations: [] } })
    render(<AIDrivenRRM pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
