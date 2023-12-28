import { IncidentFilter }              from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen
}                    from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { expectedData } from './__tests__/fixtures'
import { api }          from './services'

import { IncidentsCountBySeverities } from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('IncidentDashboard', () => {

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('renders incident and category data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsCountBySeveritiesWidget', expectedData)
    render(<IncidentsCountBySeverities filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('2 clients impacted')).toBeVisible()
  })

  it('handles no data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsCountBySeveritiesWidget', {
      data: {
        network: {
          ...expectedData.data.network,
          incidentsCount: {
            ...expectedData.data.network.incidentsCount,
            total: 0
          }
        }
      }
    })
    render(<IncidentsCountBySeverities filters={filters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No reported incidents')).toBeVisible()
  })
})
