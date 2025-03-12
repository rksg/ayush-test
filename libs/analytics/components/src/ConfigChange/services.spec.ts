import { defaultNetworkPath }                    from '@acx-ui/analytics/utils'
import { Provider, dataApiURL }                  from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'
import { DateRange }                             from '@acx-ui/utils'

import { configChangeSeries, configChanges, kpiForOverview, pagedConfigChanges } from './__tests__/fixtures'
import {
  useConfigChangeQuery,
  useConfigChangeSeriesQuery,
  usePagedConfigChangeQuery,
  useKPIChangesQuery,
  useDownloadConfigChange,
  SORTER_ABBR
} from './services'

describe('useConfigChangeQuery', () => {
  const param = {
    path: defaultNetworkPath,
    startDate: '2023-04-01T16:00:00+08:00',
    endDate: '2023-04-30T16:00:00+08:00',
    range: DateRange.last24Hours
  }
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    const { result } = renderHook(() =>
      useConfigChangeQuery({ ...param, showIntentAI: true }), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(configChanges
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      .map((item, id) => ({ ...item, id })))
  })
  it('should return empty data', async () => {
    const noDataParam = {
      ...param,
      startDate: '2023-05-01T16:00:00+08:00',
      endDate: '2023-05-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    const { result } = renderHook(() =>
      useConfigChangeQuery({ ...noDataParam, showIntentAI: true }), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('usePagedConfigChangeQuery', () => {
  const param = {
    path: defaultNetworkPath,
    startDate: '2023-04-01T16:00:00+08:00',
    endDate: '2023-04-30T16:00:00+08:00',
    range: DateRange.last24Hours,
    filterBy: { entityName: 'entityName', entityType: [ 'ap' ] },
    sortBy: SORTER_ABBR.DESC
  }
  afterEach(() => jest.resetAllMocks())
  it('should return correct data when SORTER_ABBR.DESC', async () => {
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: pagedConfigChanges } } } })
    const { result } = renderHook(() =>
      usePagedConfigChangeQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: pagedConfigChanges.data.map((item, id) => ({ ...item, id })),
      total: configChanges.length
    })
  })
  it('should return correct data when SORTER_ABBR.ASC', async () => {
    const ascDataParam = {
      ...param,
      startDate: '2023-05-01T16:00:00+08:00',
      endDate: '2023-05-30T16:00:00+08:00',
      sortBy: SORTER_ABBR.ASC,
      page: 1,
      pageSize: 10
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: pagedConfigChanges } } } })
    const { result } = renderHook(() =>
      usePagedConfigChangeQuery(ascDataParam), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      data: pagedConfigChanges.data
        .map((item, id) => ({ ...item, id: configChanges.length - id - 1 })),
      total: configChanges.length
    })
  })
  it('should return empty data', async () => {
    const noDataParam = {
      ...param,
      startDate: '2023-06-01T16:00:00+08:00',
      endDate: '2023-06-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'PagedConfigChange',
      { data: { network: { hierarchyNode: { pagedConfigChanges: { data: [], total: 0 } } } } })
    const { result } = renderHook(() =>
      usePagedConfigChangeQuery(noDataParam), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [], total: 0 })
  })
})

describe('useConfigChangeSeriesQuery', () => {
  const param = {
    path: defaultNetworkPath,
    startDate: '2023-04-01T16:00:00+08:00',
    endDate: '2023-04-30T16:00:00+08:00',
    range: DateRange.last24Hours,
    filterBy: { entityName: 'entityName', entityType: [ 'ap' ] }
  }
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries } } } })
    const { result } = renderHook(() => useConfigChangeSeriesQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(configChangeSeries
      .map((item, id) => ({ ...item, id })))
  })
  it('should return empty data', async () => {
    const noDataParam = {
      ...param,
      startDate: '2023-05-01T16:00:00+08:00',
      endDate: '2023-05-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: [] } } } })
    const { result } = renderHook(() =>
      useConfigChangeSeriesQuery(noDataParam), { wrapper: Provider })
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
    mockGraphqlQuery(dataApiURL, 'ConfigChangeKPIChanges', { data: { network: kpiForOverview } })
    const { result } = renderHook(() => useKPIChangesQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(kpiForOverview)
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

describe('useDownloadConfigChange', () => {
  const param = {
    path: defaultNetworkPath,
    startDate: '2023-04-01T16:00:00+08:00',
    endDate: '2023-04-30T16:00:00+08:00',
    range: DateRange.last24Hours,
    filterBy: { entityName: 'entityName', entityType: [ 'ap' ] }
  }
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries } } } })
    const { result } = renderHook(() => useDownloadConfigChange(), { wrapper: Provider })
    const [ download ] = result.current
    const data = await download(param).unwrap()
    expect(data).toEqual(configChangeSeries.map((item, id) => ({ ...item, id })))
  })
  it('should return empty data', async () => {
    const noDataParam = {
      ...param,
      startDate: '2023-05-01T16:00:00+08:00',
      endDate: '2023-05-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: [] } } } })
    const { result } = renderHook(() => useDownloadConfigChange(), { wrapper: Provider })
    const [ download ] = result.current
    const data = await download(noDataParam).unwrap()
    expect(data).toEqual([])
  })
})