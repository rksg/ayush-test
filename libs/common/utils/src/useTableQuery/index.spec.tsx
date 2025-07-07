import { rest } from 'msw'

import { act, mockServer, renderHook } from '@acx-ui/test-utils'

import { useTestQuery, testUrl, Provider } from './__tests__/mockServer'

import {
  usePollingTableQuery,
  useTableQuery,
  createNewTableHttpRequest,
  transferToNewTablePaginationParams,
  transferToTableResult,
  TableChangePayload,
  NewTableResult,
  NewTablePageable,
  NewAPITableResult,
  transferNewResToTableResult
}                       from '.'

describe('useTableQuery', ()=>{
  beforeEach(() => mockServer.use(
    rest.post( testUrl.url, (req, res, ctx) =>
      res(ctx.json({ data: [{ name: 'name' }], totalCount: 100 })))
  ))
  it('usePollingTableQuery', () => {
    const { result } = renderHook(
      () => usePollingTableQuery({ useQuery: useTestQuery, defaultPayload: {} }),
      { wrapper: ({ children }) => <Provider children={children} /> }
    )
    expect(result.current.payload).toEqual({
      page: 1, pageSize: 10, defaultPageSize: 10, total: 0, sortField: 'name', sortOrder: 'ASC'
    })
  })

  describe('useTableQuery', () => {
    it('should handle initial search', async () => {
      const { result } = renderHook(
        () => useTableQuery({
          useQuery: useTestQuery,
          defaultPayload: {},
          search: {
            searchTargetFields: ['searchTarget1', 'searchTarget2'],
            searchString: 'search'
          }
        }),
        { wrapper: ({ children }) => <Provider children={children} /> })
      expect(result.current.payload).toEqual(expect.objectContaining({
        searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: 'search'
      }))
      await act(async () => {
        result.current.handleFilterChange(
          {}, { searchTargetFields: ['newSearchTarget'], searchString: 'new-search' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        searchTargetFields: ['newSearchTarget'], searchString: 'new-search'
      }))
      await act(async () => {
        result.current.handleFilterChange({}, { searchString: 'new-search' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: 'new-search'
      }))
      await act(async () => {
        result.current.handleFilterChange({}, { searchString: '' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: 'search'
      }))
    })
    it('should handlePagination', async () => {
      const { result } = renderHook(
        () => useTableQuery({
          useQuery: useTestQuery, defaultPayload: {}, pagination: { page: 15 } }),
        { wrapper: ({ children }) => <Provider children={children} /> }
      )
      expect(result.current.pagination).toEqual({
        current: 15, page: 15, pageSize: 10, defaultPageSize: 10, total: 0 })
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      expect(result.current.pagination).toEqual({
        current: 1, page: 1, pageSize: 10, defaultPageSize: 10, total: 100 })
    })
    it('should handleFilterChange', async () => {
      const defaultSearch = {
        searchTargetFields: ['searchTarget1', 'searchTarget2']
      }
      const defaultPayload = {
        filters: { default: ['filter1', 'filter2'] }
      }
      const { result } = renderHook(
        () => useTableQuery({ useQuery: useTestQuery, defaultPayload, search: defaultSearch }),
        { wrapper: ({ children }) => <Provider children={children} /> }
      )
      expect(result.current.payload).not
        .toContain({ searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: '' })

      await act(async () => {
        result.current.handleFilterChange(
          { otherFilter: ['otherFilter'] }, { searchString: 'search' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        filters: { ...defaultPayload.filters, otherFilter: ['otherFilter'] },
        searchTargetFields: ['searchTarget1', 'searchTarget2'],
        searchString: 'search'
      }))

      await act(async () => {
        result.current.handleFilterChange(
          { default: ['newFilter'] }, { searchString: '' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        filters: { default: ['newFilter'], otherFilter: ['otherFilter'] }
      }))
      expect(result.current.payload).not
        .toContain({ searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: '' })

      await act(async () => {
        result.current.handleFilterChange({}, { searchString: '' })
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        filters: defaultPayload.filters
      }))
      expect(result.current.payload).not
        .toContain({ searchTargetFields: ['searchTarget1', 'searchTarget2'], searchString: '' })

      await act(async () => {
        result.current.handleFilterChange({}, {}, 'groupBy')
      })
      expect(result.current.payload).toEqual(expect.objectContaining({
        filters: defaultPayload.filters
      }))
      expect(result.current.payload).toEqual(expect.objectContaining({
        groupBy: 'groupBy'
      }))
    })

    it('should handleTableChange', async () => {
      const { result } = renderHook(
        () => useTableQuery({ useQuery: useTestQuery, defaultPayload: {} }),
        { wrapper: ({ children }) => <Provider children={children} /> }
      )
      const pagination = { current: 5, pageSize: 10 }
      const sorter = { columnKey: 'severity', field: 'severity', order: 'ascend' as const }
      const extra = { action: 'sort' as const, currentDataSource: [] }
      await act(async () => {
        result.current.handleTableChange!(pagination, {}, sorter, extra)
      })
      expect(result.current.sorter).toEqual({ sortField: 'severity', sortOrder: 'ASC' })
      expect(result.current.pagination).toEqual({
        current: 5, page: 5, pageSize: 10, defaultPageSize: 10, total: 100 })
      expect(result.current.payload).toEqual(expect.objectContaining({
        sortField: 'severity', sortOrder: 'ASC', page: 5, pageSize: 10
      }))

      const multiSorters = [
        { columnKey: 'severity', field: ['severity'], order: 'descend' as const },
        { columnKey: 'severity2', field: 'severity2', order: 'descend' as const }
      ]
      await act(async () => {
        result.current.handleTableChange!(pagination, {}, multiSorters, extra)
      })
      expect(result.current.sorter).toEqual({ sortField: 'severity', sortOrder: 'DESC' })
      expect(result.current.payload).toEqual(expect.objectContaining({
        sortField: 'severity', sortOrder: 'DESC', page: 5, pageSize: 10
      }))

      await act(async () => {
        result.current.handleTableChange!(pagination, {}, {}, extra)
      })
      expect(result.current.sorter).toEqual({ sortField: 'name', sortOrder: 'ASC' })
      expect(result.current.payload).toEqual(expect.objectContaining({
        sortField: 'name', sortOrder: 'ASC', page: 5, pageSize: 10
      }))
    })
  })

  describe('createNewTableHttpRequest', () => {
    const apiInfo = { method: 'get', url: '/HelloWorld' }
    const params = { param: 'param' }
    const payload = {
      sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10 } as TableChangePayload
    const expectedResult = {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      method: 'get',
      credentials: 'include',
      url: 'http://localhost/HelloWorld'
    }
    it('should return correct value', () => {
      expect(createNewTableHttpRequest({ apiInfo, params, payload })).toEqual(expectedResult)
    })
    it('should return correct value when no params', () => {
      expect(createNewTableHttpRequest({ apiInfo, payload })).toEqual(expectedResult)
    })
  })

  describe('transferToNewTablePaginationParams', () => {
    it('should return correct value', () => {
      const payload = {
        sortField: 'name', sortOrder: 'DESC', page: 10, pageSize: 10 } as TableChangePayload
      expect(transferToNewTablePaginationParams(payload))
        .toEqual({ page: '9', pageSize: '10', sort: 'name,desc' })
    })
    it('should return correct value when payload is undefined', () => {
      expect(transferToNewTablePaginationParams(undefined))
        .toEqual({ page: '0', pageSize: '10', sort: 'name,asc' })
    })
  })

  it('transferToTableResult should return correct value', () => {
    interface TestData { name: string }
    const data = {
      totalElements: 1,
      totalPages: 1,
      content: [{ name: 'name' }],
      pageable: { pageNumber: 1 } as NewTablePageable
    } as NewTableResult<TestData>
    expect(transferToTableResult(data)).toEqual({
      data: [{ name: 'name' }], page: 2, totalCount: 1 })
  })

  it('transferNewResToTableResult should return correct value', () => {
    interface TestData { name: string }
    const data = {
      paging: { page: 1, pageSize: 10, totalCount: 1 },
      content: [{ name: 'name' }]
    } as NewAPITableResult<TestData>
    expect(transferNewResToTableResult(data)).toEqual({
      data: [{ name: 'name' }], page: 2, totalCount: 1 })
  })
})
