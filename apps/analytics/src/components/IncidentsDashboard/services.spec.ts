import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import {
  NetworkPath
} from '@acx-ui/analytics/utils'
import { mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }        from '@acx-ui/utils'

import { api } from './services'

describe('IncidentsDashboard: services', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleWare) =>
      getDefaultMiddleWare().concat([dataApi.middleware])
  })

  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath
  } as const

  const expectedResult = {
    network: {
      hierarchyNode: {
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
    }
  }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('headerApi should return empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: {
        network: {
          hierarchyNode: undefined
        }
      }
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverityDashboard.initiate(props)
    )

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toBeUndefined()
  })

  it('api should return populated data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: {
        network: {
          hierarchyNode: expectedResult
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