import { defaultNetworkPath }                 from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { NetworkPath, PathFilter, DateRange } from '@acx-ui/utils'

import { aiOpsListResult, aiOpsNonNewListResult } from '../Recommendations/__tests__/fixtures'
import { api }                                    from '../Recommendations/services'

import { AIOperations } from '.'

const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('AIOperations dashboard', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', {
      data: aiOpsListResult
    })
    render(<AIOperations pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    expect(await screen.findAllByText('Wi-Fi Client Experience')).toHaveLength(2)
    expect(await screen.findByText('06/16/2023')).toBeVisible()
    expect(await screen.findByText('07/06/2023')).toBeVisible()
  })

  it('renders non new recommendations', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', {
      data: aiOpsNonNewListResult
    })
    render(<AIOperations pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    expect(await screen.findAllByText('Wi-Fi Client Experience')).toHaveLength(2)
    expect(await screen.findByText('Applied on 06/16/2023')).toBeVisible()
    expect(await screen.findByText('Reverted on 07/06/2023')).toBeVisible()
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
    render(<AIOperations pathFilters={switchPathFilters} />, {
      route: true,
      wrapper: Provider
    })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Your network is already running in an optimal configuration and we don’t have any AI Operations to recommend currently.')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', {
      data: {
        aiOpsCount: 0,
        recommendations: []
      }
    })
    render(<AIOperations pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Your network is already running in an optimal configuration and we don’t have any AI Operations to recommend currently.')).toBeVisible()
  })
})
