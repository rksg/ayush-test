import { dataApiURL }       from '@acx-ui/analytics/services'
import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }        from '@acx-ui/utils'

import { api } from './services'

describe('IncidentsBySeverityApi', () => {
  const props : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
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
