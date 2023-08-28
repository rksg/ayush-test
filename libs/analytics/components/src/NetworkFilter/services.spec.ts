import { dataApiURL, Provider, store }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'
import { DateRange }                             from '@acx-ui/utils'

import * as incidentServices from '../IncidentTable/services'

import * as fixtures              from './__tests__/fixtures'
import { api, useHierarchyQuery } from './services'

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


describe('useHierarchyQuery', () => {
  const props = {
    startDate: '2023-08-16T00:00:00+08:00',
    endDate: '2023-08-023T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
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
    expect(data).toStrictEqual(fixtures.hierarchyQueryResult)
    expect(error).toBe(undefined)
  })

  it('should handle error for hierarchy', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {},
      error: new Error('something went wrong!')
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    expect(status).toBe('rejected')
    expect(data).toStrictEqual(undefined)
    expect(error).toBeTruthy()
  })

  it('should return correct data for main hook', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: fixtures.hierarchyQueryResult
    })

    await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    const queryProps = {
      filters: props,
      shouldQuerySwitch: true
    }
    const { result, unmount } = renderHook(
      () => useHierarchyQuery(queryProps),
      { wrapper: Provider }
    )
    await waitFor(async () => expect(result.current.isSuccess).toBeTruthy())
    await waitFor(async () => expect(result.current.isFetching).toBeFalsy())
    await waitFor(async () => expect(result.current.data)
      .toStrictEqual(fixtures.hierarchyQueryOuput))
    unmount()
  })

  it('should return correctly without incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          apHierarchy: [
            {
              name: 'test-system',
              type: 'system',
              children: [
                {
                  name: '1||Administration Domain',
                  type: 'domain',
                  children: [
                    {
                      name: 'child under admin',
                      type: 'zone'
                    }
                  ]
                }, {
                  name: '2||second domain',
                  type: 'domain'
                }
              ]
            }
          ]
        }
      }
    })

    await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    const queryProps = {
      filters: props,
      shouldQuerySwitch: false
    }
    const { result, unmount } = renderHook(() =>
      useHierarchyQuery(queryProps),
    { wrapper: Provider }
    )
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    await waitFor(() => expect(result.current.isFetching).toBeFalsy())
    await waitFor(() => expect(result.current.data).toStrictEqual({
      network: {
        switchHierarchy: undefined,
        apHierarchy: [
          {
            name: 'test-system',
            type: 'system',
            children: [
              {
                name: 'second domain',
                type: 'domain',
                parentKey: [
                  'test-system',
                  'children'
                ]
              },
              {
                name: 'child under admin',
                type: 'zone',
                parentKey: [
                  'test-system',
                  'children'
                ]
              }
            ]
          }
        ]
      }
    }))
    unmount()
  })

  it('should not error on undefined data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: { network: {} }
    })

    await store.dispatch(
      api.endpoints.networkHierarchy.initiate(props)
    )

    const queryProps = {
      includeIncidents: true,
      filters: props,
      shouldQuerySwitch: true
    }
    const { result, unmount } = renderHook(() =>
      useHierarchyQuery(queryProps),
    { wrapper: Provider }
    )
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    await waitFor(() => expect(result.current.isFetching).toBeFalsy())
    await waitFor(() => expect(result.current.data).toStrictEqual({
      network: { apHierarchy: undefined, switchHierarchy: undefined } }))
    unmount()
  })
})