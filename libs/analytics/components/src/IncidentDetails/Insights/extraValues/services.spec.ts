import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { drawerApi } from './services'

describe('rogueAPs', () => {
  const payload = { id: 'id', search: '', n: 100 }
  afterEach(() => store.dispatch(drawerApi.util.resetApiState()))
  it('should return correct data', async () => {
    const expectedResult = { incident: { rogueAPs: [], rogueAPCount: 0 } }
    mockGraphqlQuery(dataApiURL, 'rogueAPs', { data: expectedResult })
    const { status, data, error } = await store.dispatch(
      drawerApi.endpoints.rogueAPs.initiate(payload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({ rogueAPs: [], rogueAPCount: 0 })
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      drawerApi.endpoints.rogueAPs.initiate(payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
