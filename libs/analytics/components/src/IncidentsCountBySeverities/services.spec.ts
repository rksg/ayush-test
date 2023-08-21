import '@testing-library/jest-dom'

import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { expectedData } from './__tests__/fixtures'
import { api }          from './services'

describe('services', () => {
  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  } as const

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('api should return populated data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsCountBySeveritiesWidget', expectedData)
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsCountBySeverities.initiate(props)
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject({
      total: 16,
      items: [
        { severity: 'P1', incidentsCount: 1, impactedClients: 2 },
        { severity: 'P2', incidentsCount: 3, impactedClients: 4 },
        { severity: 'P3', incidentsCount: 5, impactedClients: 6 },
        { severity: 'P4', incidentsCount: 7, impactedClients: 8 }
      ]
    })
  })
})
