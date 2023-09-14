import { IncidentFilter }                     from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
}                    from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { crrmListResult } from '../Recommendations/__tests__/fixtures'
import { api }            from '../Recommendations/services'

import { AIDrivenRRM } from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('AIDrivenRRM dashboard', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: crrmListResult
    })
    render(<AIDrivenRRM filters={filters} />, {
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
    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are recommendations for 3 zones covering 100 possible RRM combinations. Currently 1/3 zones have been optimized.')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: {
        recommendations: []
      }
    })
    render(<AIDrivenRRM filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI has confirmed that all zones are currently operating with the optimal RRM onfigurations and no further recommendation is required.')).toBeVisible()
  })
})
