import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import * as incidentServices from '../IncidentTable/services'

import * as fixtures from './__tests__/fixtures'
import { api }       from './services'

describe('networkFilter', () => {
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
        hierarchyNode: fixtures.networkFilterResult
      }
    }
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.children)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkFilter.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})

describe('recentNetworkFilter', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: fixtures.recentNetworkFilterResult
      }
    }
    mockGraphqlQuery(dataApiURL, 'RecentNetworkHierarchy', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recentNetworkFilter.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.children)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'RecentNetworkHierarchy', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recentNetworkFilter.initiate(props)
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
    store.dispatch(incidentServices.api.util.resetApiState())
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
        shouldQuerySwitch: false
      })
    )

    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(fixtures.apsOnlyHierarchyQueryOuput)
    expect(error).toBe(undefined)
  })

  it('should handle error for hierarchy', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: undefined,
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