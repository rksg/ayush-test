import React, { useEffect, useState } from 'react'

import { TableProps }  from 'antd'
import { FilterValue } from 'antd/lib/table/interface'
import _               from 'lodash'

import { useParams, Params } from '@acx-ui/react-router-dom'
import {
  RequestPayload,
  UseQuery,
  UseQueryResult,
  UseQueryOptions
} from '@acx-ui/types'
import {
  ApiInfo,
  createHttpRequest,
  TABLE_DEFAULT_PAGE_SIZE,
  TABLE_MAX_PAGE_SIZE,
  TABLE_QUERY_POLLING_INTERVAL
} from '@acx-ui/utils'


// export { RequestPayload }

export interface RequestFormData <FormData = unknown> {
  params?: Params<string>
  payload?: FormData
}

export interface TableResult <ResultItemType, ResultExtra = unknown> {
  data: ResultItemType[]
  page: number
  totalCount: number
  extra?: ResultExtra
}

export interface TABLE_QUERY <
  ResultType = Record<string, unknown>,
  Payload extends RequestPayload = RequestPayload,
  ResultExtra = unknown
> {
  defaultPayload: Partial<Payload>
  useQuery: UseQuery<
    TableResult<ResultType, ResultExtra>,
    { params: Params<string>, payload: Payload }
  >
  apiParams?: Record<string, string>
  pagination?: Partial<PAGINATION>
  sorter?: SORTER
  search?: SEARCH
  rowKey?: string
  option?: UseQueryOptions
  enableSelectAllPagesData?: string[] // query fields for all data
}
export type PAGINATION = {
  page: number,
  pageSize: number,
  defaultPageSize: number,
  total: number
}

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: TABLE_DEFAULT_PAGE_SIZE,
  defaultPageSize: TABLE_DEFAULT_PAGE_SIZE,
  total: 0
}

const SORTER_ABBR = {
  descend: 'DESC',
  ascend: 'ASC'
}

export interface SORTER {
  sortField: string,
  sortOrder: string
}

const DEFAULT_SORTER = {
  sortField: 'name',
  sortOrder: SORTER_ABBR.ascend
}

export interface SEARCH {
  searchString?: string
  searchTargetFields?: string[]
}

export interface FILTER extends Record<string, FilterValue | null> {}
export type GROUPBY = string | null

const transferSorter = (order:string) => {
  return order === 'ascend' ? SORTER_ABBR.ascend : SORTER_ABBR.descend
}

export interface TableQuery<ResultType, Payload, ResultExtra>
  extends UseQueryResult<TableResult<ResultType, ResultExtra>> {
  pagination: PAGINATION,
  sorter: SORTER,
  search: SEARCH,
  handleTableChange: TableProps<ResultType>['onChange'],
  handleFilterChange: (filters: FILTER, search: SEARCH, groupBy?: GROUPBY) => void
  payload: Payload,
  setPayload: React.Dispatch<React.SetStateAction<Payload>>,
  getAllPagesData: ()=> ResultType[]
}

export function usePollingTableQuery <
  ResultType,
  Payload extends RequestPayload<unknown> = RequestPayload<unknown>,
  ResultExtra = unknown
> (params:
  TABLE_QUERY<ResultType, Payload, ResultExtra> &
  { option?: UseQueryOptions }
) {
  return useTableQuery({
    ...params,
    option: {
      pollingInterval: TABLE_QUERY_POLLING_INTERVAL,
      ...(params.option || {})
    }
  })
}

export function useTableQuery <
  ResultType,
  Payload extends RequestPayload<unknown> = RequestPayload<unknown>,
  ResultExtra = unknown
  > (option: TABLE_QUERY<ResultType, Payload, ResultExtra>) {

  const initialPagination = {
    ...DEFAULT_PAGINATION,
    ...(option?.pagination ? {
      defaultPageSize: option.pagination.pageSize || TABLE_DEFAULT_PAGE_SIZE,
      ...option.pagination
    } : {})
  }

  const initialSorter = {
    ...DEFAULT_SORTER,
    ...(option?.sorter || {})
  }

  const initialSearch = option?.search || {}

  const initialPayload = {
    ...option.defaultPayload,
    ...(initialPagination as unknown as Partial<Payload>),
    ...(initialSorter as unknown as Partial<Payload>),
    ...(initialSearch.searchString && initialSearch)
  } as Payload

  const [pagination, setPagination] = useState<PAGINATION>(initialPagination)
  const [sorter, setSorter] = useState<SORTER>(initialSorter)
  const [search, setSearch] = useState<SEARCH>(initialSearch)
  const [payload, setPayload] = useState<Payload>(initialPayload)
  const [filterKeys, setFilterKeys] = useState<string[]>([])

  const params = useParams()
  const api = option.useQuery({
    params: { ...params, ...option.apiParams },
    payload: payload
  }, option.option)

  const getAllDataApi = option.enableSelectAllPagesData && option.useQuery({
    params: { ...params, ...option.apiParams },
    payload: {
      ...payload,
      fields: option.enableSelectAllPagesData,
      page: 1,
      pageSize: TABLE_MAX_PAGE_SIZE
    }
  }, option.option)

  useEffect(() => {
    const handlePagination = (data?: TableResult<ResultType>) => {
      if (data) {
        const totalPage = Math.ceil(data.totalCount/pagination.pageSize)
        const page = totalPage >= pagination.page ? pagination.page : 1
        const pageChanged = pagination.page !== page
        setPagination((prev) => ({ ...prev, page, total: data.totalCount } as PAGINATION))
        if(pageChanged) { setPayload({ ...payload, page }) }
      }
    }
    handlePagination(api.data)
  }, [api.data])

  const getAllPagesData = (() => {
    return getAllDataApi && getAllDataApi.data ? getAllDataApi.data.data : []
  })

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH, groupBy? : GROUPBY) => {
    const { searchString, searchTargetFields, filters, ...rest } = payload
    const toBeRemovedFilter = _.isEmpty(customFilters)
      ? filterKeys
      : Object.keys(customFilters).filter(key => !customFilters[key])
    const toBeSearch = (customSearch.searchString
      ? { ...initialSearch, ...customSearch }
      : initialSearch.searchString && initialSearch) as SEARCH
    setPayload({
      ...rest,
      ...toBeSearch,
      filters: {
        ..._.omit({ ...filters as Object, ...customFilters }, toBeRemovedFilter),
        ..._.pick(initialPayload.filters, toBeRemovedFilter)
      },
      groupBy
    } as unknown as Payload)
    setSearch(toBeSearch)
    setFilterKeys([...new Set([ ...filterKeys, ...Object.keys(customFilters) ])]
      .filter(key=>!toBeRemovedFilter.includes(key)))
  }

  const handleTableChange: TableProps<ResultType>['onChange'] = (
    customPagination, _, customSorters
  ) => {
    // Implementation expect there will only be 1 sortable column
    const customSorter = Array.isArray(customSorters)
      ? customSorters[0] : customSorters

    const sorterKey = Array.isArray(customSorter.field)
      ? customSorter.columnKey : customSorter.field

    const sorterDetail = {
      sortField: sorterKey || DEFAULT_SORTER.sortField,
      sortOrder: customSorter.order ? transferSorter(customSorter.order) : DEFAULT_SORTER.sortOrder
    } as SORTER

    const paginationDetail = {
      page: customPagination.current ?? payload.page,
      pageSize: customPagination.pageSize ?? payload.pageSize
    } as PAGINATION

    const tableProps = { ...sorterDetail, ...paginationDetail }

    setSorter({ ...sorter, ...sorterDetail })
    setPagination({ ...pagination, ...paginationDetail })
    setPayload({ ...payload, ...tableProps })
  }
  return {
    pagination: { ...pagination, current: pagination.page },
    sorter,
    search,
    handleFilterChange,
    handleTableChange,
    payload,
    setPayload,
    getAllPagesData,
    ...api
  } as TableQuery<ResultType, Payload, ResultExtra>
}

export interface NewTablePageable {
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  sort: {
    unsorted: boolean,
    sorted: boolean,
    empty: boolean
  }
  unpaged: boolean
}

export interface TableChangePayload {
  sortField: string
  sortOrder: 'ASC' | 'DESC'
  page: number
  pageSize: number
  pageStartZero?: boolean
}

export interface NewTableResult<T> {
  totalElements: number
  totalPages: number
  sort: {
    unsorted: boolean,
    sorted: boolean,
    empty: boolean
  }
  content: T[]
  pageable: NewTablePageable
}
export interface NewAPITableResult<T>{
  content: T[]
  paging: {
    page: number,
    pageSize: number,
    totalCount: number,
    pageCount?: number
  }
}

interface CreateNewTableHttpRequestProps {
  apiInfo: ApiInfo
  params?: Params<string>
  payload?: TableChangePayload
}

export function createNewTableHttpRequest (props: CreateNewTableHttpRequestProps) {
  const { apiInfo, params = {}, payload } = props
  return createHttpRequest(apiInfo, { ...params, ...transferToNewTablePaginationParams(payload) })
}

export function transferToTableResult<T> (newResult: NewTableResult<T>): TableResult<T> {
  return {
    data: newResult.content,
    page: newResult.pageable ? newResult.pageable.pageNumber + 1 : 1,
    totalCount: newResult.totalElements
  }
}

// eslint-disable-next-line max-len
export function transferNewResToTableResult<T> (newResult: NewAPITableResult<T>, props?: { pageStartZero: boolean }): TableResult<T> {
  const pageStartZero = props ? props.pageStartZero: false
  return {
    data: newResult.content,
    // eslint-disable-next-line max-len
    page: newResult.paging ? ( pageStartZero ? newResult.paging.page : newResult.paging.page + 1 ) : 1,
    totalCount: newResult.paging.totalCount
  }
}

export function transferToNewTablePaginationParams (payload: TableChangePayload | undefined) {
  const pagination = {
    ...DEFAULT_PAGINATION,
    ...DEFAULT_SORTER,
    pageStartZero: true,
    ...(_.omitBy(payload ?? {}, _.isNil))
  }

  return {
    pageSize: pagination.pageSize.toString(),
    page: (pagination.pageStartZero? (pagination.page - 1) : pagination.page).toString(),
    sort: pagination.sortField + ',' + pagination.sortOrder.toLowerCase()
  }
}
