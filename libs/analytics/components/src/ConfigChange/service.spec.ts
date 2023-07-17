import { Provider, dataApiURL }                  from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { configChanges, kpiChanges } from './__tests__/fixtures'
import {
  useConfigChangeQuery,
  useKPIChangesQuery
} from './services'

describe('useConfigChangeQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    const param = {
      path: [{ type: 'network' as const, name: 'Network' }],
      filter: {},
      start: '2023-04-01T16:00:00+08:00',
      end: '2023-04-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    const { result } = renderHook(() => useConfigChangeQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(configChanges.map((item, id) => ({ ...item, id })))
  })
  it('should return empty data', async () => {
    const param = {
      path: [{ type: 'network' as const, name: 'Network' }],
      filter: {},
      start: '2023-05-01T16:00:00+08:00',
      end: '2023-05-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    const { result } = renderHook(() => useConfigChangeQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useKPIChangesQuery', () => {
  afterEach(() => jest.resetAllMocks())
  const kpis= [
    'connectionSuccess', 'timeToConnect', 'clientThroughPut',
    'apCapacity', 'apUpTime', 'onlineAPCount'
  ]
  it('should return correct data', async () => {
    const param = {
      kpis,
      path: [{ type: 'network' as const, name: 'Network' }],
      filter: {},
      beforeStart: '2023-05-26T09:37:10.758Z',
      beforeEnd: '2023-05-27T09:37:10.758Z',
      afterStart: '2023-06-20T08:49:59.000Z',
      afterEnd: '2023-06-21T08:49:59.000Z'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiChanges } })
    const { result } = renderHook(() => useKPIChangesQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(kpiChanges)
  })
  it('should return empty data', async () => {
    const param = {
      kpis,
      path: [{ type: 'network' as const, name: 'Network' }],
      filter: {},
      beforeStart: '2023-05-26T09:37:10.758Z',
      beforeEnd: '2023-05-27T09:37:10.758Z',
      afterStart: '2023-06-19T08:49:59.000Z',
      afterEnd: '2023-06-20T08:49:59.000Z'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges',{ data: { network: {} } })
    const { result } = renderHook(() => useKPIChangesQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({})
  })
})
