import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { api } from './services'

describe('IncidentsBySeverityApi', () => {
  const props : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          P1: 1,
          P2: 2,
          P3: 3,
          P4: 4
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverity.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsBySeverity.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})


describe('IncidentsListBySeverityApi', () => {
  const paths = {
    path1: [
      { type: 'network', name: 'Network' },
      { type: 'apGroup', name: 'apgId1' }
    ],
    path2: [
      { type: 'network', name: 'Network' },
      { type: 'apGroup', name: 'apgId2' }
    ]
  }
  const variables = {
    ...paths,
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00'
  }
  const props = { paths, variables }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        incidentCount0: {
          P1: 1,
          P2: 2,
          P3: 3,
          P4: 4
        },
        incidentCount1: {
          P1: 4,
          P2: 3,
          P3: 2,
          P4: 1
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsListBySeverity.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data?.[0]).toStrictEqual(expectedResult.network.incidentCount0)
    expect(data?.[1]).toStrictEqual(expectedResult.network.incidentCount1)
    expect(error).toBe(undefined)
  })

  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsListBySeverity.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
