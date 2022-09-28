import '@testing-library/jest-dom'
import { dataApiURL } from '@acx-ui/analytics/services'
import {
  NetworkPath
} from '@acx-ui/analytics/utils'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }        from '@acx-ui/utils'

import { api } from './services'

describe('IncidentsDashboard: services', () => {
  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath
  } as const
  const expectedResponse = {
    P1Count: 1,
    P1Impact: {
      impactedClientCount: [2]
    },
    P2Count: 3,
    P2Impact: {
      impactedClientCount: [4]
    },
    P3Count: 5,
    P3Impact: {
      impactedClientCount: [6]
    },
    P4Count: 7,
    P4Impact: {
      impactedClientCount: [8]
    },
    connectionP1: 9,
    performanceP1: 10,
    infrastructureP1: 11,
    connectionP2: 12,
    performanceP2: 13,
    infrastructureP2: 14,
    connectionP3: 15,
    performanceP3: 16,
    infrastructureP3: 17,
    connectionP4: 18,
    performanceP4: 19,
    infrastructureP4: 20
  }
  const expectedResult = {
    P1: {
      incidentsCount: 1,
      impactedClients: {
        impactedClientCount: [2]
      },
      connection: 9,
      performance: 10,
      infrastructure: 11
    },
    P2: {
      incidentsCount: 3,
      impactedClients: {
        impactedClientCount: [4]
      },
      connection: 12,
      performance: 13,
      infrastructure: 14
    },
    P3: {
      incidentsCount: 5,
      impactedClients: {
        impactedClientCount: [6]
      },
      connection: 15,
      performance: 16,
      infrastructure: 17
    },
    P4: {
      incidentsCount: 7,
      impactedClients: {
        impactedClientCount: [8]
      },
      connection: 18,
      performance: 19,
      infrastructure: 20
    }
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('api should return populated data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: {
        network: {
          hierarchyNode: expectedResponse
        }
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverityDashboard.initiate(props)
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(expectedResult)
  })
})
