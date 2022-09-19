import { dataApiURL }       from '@acx-ui/analytics/services'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { fakeSummary }         from './__tests__/fixtures'
import { api, RequestPayload } from './services'

describe('incidentDetailsApi', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    path: [{ name: 'Network', type: 'network' }],
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'Summary', { data: fakeSummary })
    const { status, data, error } = await store.dispatch(
      api.endpoints.summary.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(fakeSummary)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'Summary', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.summary.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
