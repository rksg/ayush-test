import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import * as fixtures from './__tests__/fixtures'
import { api }       from './services'

describe('venuesHierarchy', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    querySwitch: true,
    filter: {}
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        venueHierarchy: fixtures.networkFilterResult
      }
    }
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.venuesHierarchy.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.venueHierarchy)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.venuesHierarchy.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
describe('useNetworkHierarchyQuery', () => {
  const props = {
    startDate: '2023-08-16T00:00:00+08:00',
    endDate: '2023-08-023T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {},
    shouldQuerySwitch: true
  }

  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should return correct data for api endpoint', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: fixtures.hierarchyQueryResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(fixtures.fullHierarchyQueryOuput)
    expect(error).toBe(undefined)
  })

  it('should return correctly without switch', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          apHierarchy: fixtures.hierarchyQueryResult.network.apHierarchy
        }
      }
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHierarchy.initiate({
        ...props,
        shouldQueryAp: true,
        shouldQuerySwitch: false
      })
    )

    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(fixtures.apsOnlyHierarchyQueryOuput)
    expect(error).toBe(undefined)
  })

  it('should handle error for hierarchy', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      error: new Error('something went wrong!')
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    expect(status).toBe('rejected')
    expect(data).toStrictEqual(undefined)
    expect(error).toBeTruthy()
  })
})