import '@testing-library/jest-dom'

import { dataApiURL }        from '@acx-ui/analytics/services'
import { fakeIncidentPoePd } from '@acx-ui/analytics/utils'
import { store }             from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { impactedApi } from './services'

export const expectedResult = [
  {
    name: 'ICX7550-48ZP Router',
    mac: '28:B3:71:29:8C:B6',
    ports: [
      {
        portNumber: '1/1/1',
        metadata: '{"timestamp":1665817971541}'
      },
      {
        portNumber: '1/1/2',
        metadata: '{"timestamp":1665817987689}'
      },
      {
        portNumber: '1/1/1',
        metadata: '{"timestamp":1665818267535}'
      },
      {
        portNumber: '1/1/4',
        metadata: '{"timestamp":1665818333534}'
      },
      {
        portNumber: '1/1/5',
        metadata: '{"timestamp":1665818403526}'
      },
      {
        portNumber: '1/1/13',
        metadata: '{"timestamp":1665818821671}'
      }
    ]
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
        id: fakeIncidentPoePd.id,
        search: '',
        n: 100
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
