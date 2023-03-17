import '@testing-library/jest-dom'

import { store, dataApiURL }      from '@acx-ui/store'
import { mockGraphqlQuery }       from '@acx-ui/test-utils'
import { DateRange, NetworkPath } from '@acx-ui/utils'

import { expectedIncidentDashboardData } from './__tests__/fixtures'
import { api }                           from './services'

describe('IncidentsDashboardv2: services', () => {
  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath,
    filter: {}
  } as const
  const expectedResult = {
    P1: {
      incidentsCount: 1
    },
    P2: {
      incidentsCount: 30000
    },
    P3: {
      incidentsCount: 5
    },
    P4: {
      incidentsCount: 7
    }
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('api should return populated data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: {
        network: {
          hierarchyNode: expectedIncidentDashboardData
        }
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverityDashboardv2.initiate(props)
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(expectedResult)
  })
  it('api should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverityDashboardv2.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
