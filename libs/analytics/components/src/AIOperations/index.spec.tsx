import { IncidentFilter }                     from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
}                    from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { aiOpsListResult } from '../Recommendations/__tests__/fixtures'
import { api }             from '../Recommendations/services'

import { AIOperations } from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('AIOperations dashboard', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', {
      data: aiOpsListResult
    })
    render(<AIOperations filters={filters} />, {
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

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', {
      data: {
        aiOpsCount: 0,
        recommendations: []
      }
    })
    render(<AIOperations filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
