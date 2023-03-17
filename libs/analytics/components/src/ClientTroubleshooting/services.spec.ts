import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { api } from './services'

describe('ClientInfo Api', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    clientMac: 'mac'
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      client: {
        connectionDetailsByAp: [],
        connectionEvents: [],
        connectionQualities: [],
        incidents: []
      }
    }
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.clientInfo.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.client)
    expect(error).toBe(undefined)
  })
})
