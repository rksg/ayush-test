import { dataApiURL }       from '@acx-ui/analytics/services'
import { fakeIncident1 }    from '@acx-ui/analytics/utils'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { api } from './services'

describe('incidentDetailsApi', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', { data: { incident: fakeIncident1 } })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentDetails.initiate({ id: fakeIncident1.id })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(fakeIncident1)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentDetails.initiate({ id: 'xxx' })
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
