import { IncidentFilter }              from '@acx-ui/analytics/utils'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
}                    from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { expectedData } from './__tests__/fixtures'
import { api }          from '../../services'

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
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: expectedData
    })
    render(<AIDrivenRRM filters={filters} />, {
      route: true,
      wrapper: Provider
    })
    
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    screen.logTestingPlaygroundURL()
    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('AI-Driven RRM has been run on 3 zones and already 1/3 have been optimized')).toBeVisible()
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
    render(<AIDrivenRRM filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No recommendations')).toBeVisible()
  })
})
