import '@testing-library/jest-dom'

import { dataApiURL }         from '@acx-ui/analytics/services'
import { fakeIncidentPoeLow } from '@acx-ui/analytics/utils'
import { store }              from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { impactedApi } from './services'

export const expectedResult = [
  {
    name: 'RuckusAP',
    mac: '84:23:88:2F:ED:60',
    poeMode: {
      configured: 'RKS_AP_PWR_MODE_AUTO',
      operating: 'RKS_AP_PWR_SRC_AF',
      eventTime: 1666970100000,
      apGroup: 'default'
    }
  }
]

describe('useImpactedEntitiesQuery', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should call api correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedEntities.initiate({
        id: fakeIncidentPoeLow.id,
        search: '',
        n: 100
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
