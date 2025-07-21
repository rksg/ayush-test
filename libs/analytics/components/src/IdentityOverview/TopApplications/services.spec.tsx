
import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { mockTopApplications }      from './__tests__/fixtures'
import { api, ApplicationsPayload } from './services'

describe('TopApplications services', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const payload: ApplicationsPayload = {
    startDate: '2025-05-31T00:00:00+00:00',
    endDate: '2025-06-01T00:00:00+00:00',
    n: 10,
    range: DateRange.last24Hours,
    filter: {}
  }

  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTopApplications })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual(mockTopApplications.network.hierarchyNode)
    expect(error).toBeUndefined()
  })

  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: { network: { hierarchyNode: {
        topNApplicationByTraffic: [] } } }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toEqual({ topNApplicationByTraffic: [] })
    expect(error).toBeUndefined()
  })

  it('should handle error', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.topNApplications.initiate({} as ApplicationsPayload)
    )
    expect(status).toBe('rejected')
    expect(data).toBeUndefined()
    expect(error).not.toBeUndefined()
  })
})
