import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { IncidentFilter }      from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { api } from './services'

export const topSwitchesByErrorsResponse = {
  network: {
    hierarchyNode: {
      topNSwitchesByErrors: [{
        name: 'CIOT-ISOLATION-MLISA',
        mac: 'D4:C1:9E:20:5F:25',
        inErr: 1,
        outErr: 1
      },
      {
        name: 'Fong@Home',
        mac: 'D4:C1:9E:95:CF:DA',
        inErr: 2,
        outErr: 1
      }]
    }
  }
}

describe('switchesByErrorsApi', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const props: IncidentFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByErrorsWidget', {
      data: topSwitchesByErrorsResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchesByErrors.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(topSwitchesByErrorsResponse.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByErrorsWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchesByErrors.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
