import { defaultNetworkPath }                 from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { PathFilter, DateRange } from '@acx-ui/utils'

import { api } from '../Recommendations/services'

import { expectedData } from './__tests__/fixtures'

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
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: expectedData
    })
    render(<AIOperations pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Client Experience')).toBeVisible()
    expect(await screen.findByText('Infrastructure')).toBeVisible()
    expect(await screen.findByText('06/16/2023')).toBeVisible()
    expect(await screen.findByText('07/06/2023')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: {
        recommendations: []
      }
    })
    render(<AIOperations pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
