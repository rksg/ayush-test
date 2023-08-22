import { IncidentFilter }                     from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
}                    from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { api as recommendationDetailsApi } from '../../RecommendationDetails/services'
import { api as recommendationListApi }    from '../../services'

import { expectedData, expectedDetailData } from './__tests__/fixtures'

import { AIDrivenRRM } from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('AIDrivenRRM dashboard', () => {
  beforeEach(() => store.dispatch(recommendationListApi.util.resetApiState()))
  beforeEach(() => store.dispatch(recommendationDetailsApi.util.resetApiState()))

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: expectedData
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: expectedDetailData
    })

    render(<AIDrivenRRM filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText(
      'AI-Driven RRM has been run on 3 zones and already 1/3 have been optimized')).toBeVisible()
    expect(await screen.findByText('Venue(zone-1)')).toBeVisible()
    expect(await screen.findByText('Venue(zone-2)')).toBeVisible()
    expect(await screen.findByText('Venue(Deeps Place)')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: {
        recommendations: []
      }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: []
    })
    render(<AIDrivenRRM filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
