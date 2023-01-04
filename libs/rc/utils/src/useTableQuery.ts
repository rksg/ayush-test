import React, { useEffect, useState } from 'react'

import { TableProps } from 'antd'

import { useParams, Params }                         from '@acx-ui/react-router-dom'
import { UseQuery, UseQueryResult, UseQueryOptions } from '@acx-ui/types'

import { ApiInfo, createHttpRequest } from './apiService'

export const TABLE_QUERY_POLLING_INTERVAL = 30_000
export const TABLE_QUERY_LONG_POLLING_INTERVAL = 300_000

export interface RequestPayload <Payload = unknown> extends Record<string,unknown> {
  params?: Params<string>
  payload?: Payload
}
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
  rowKey?: string
  option?: UseQueryOptions
}
export type PAGINATION = {
  current: number,
  pageSize: number,
  total: number
}

const DEFAULT_PAGINATION = {
  page: 1,
  current: 1,
  pageSize: 10,
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

const transferSorter = (order:string) => {
  return order === 'ascend' ? SORTER_ABBR.ascend : SORTER_ABBR.descend
}

export interface TableQuery<ResultType, Payload, ResultExtra>
  extends UseQueryResult<TableResult<ResultType, ResultExtra>> {
  pagination: PAGINATION,
  sorter: SORTER,
  setSorter: React.Dispatch<React.SetStateAction<SORTER>>,
  handleTableChange: TableProps<ResultType>['onChange'],
  payload: Payload,
  setPayload: React.Dispatch<React.SetStateAction<Payload>>,
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
    ...(option?.pagination || {})
  }

  const initialSorter = {
    ...DEFAULT_SORTER,
    ...(option?.sorter || {})
  }

  const initialPayload = {
    ...option.defaultPayload,
    ...(initialPagination as unknown as Partial<Payload>),
    ...(initialSorter as unknown as Partial<Payload>)
  } as Payload

  const [pagination, setPagination] = useState<PAGINATION>(initialPagination)
  const [sorter, setSorter] = useState<SORTER>(initialSorter)
  const [payload, setPayload] = useState<Payload>(initialPayload)

  const params = useParams()
  const api = option.useQuery({
    params: { ...params, ...option.apiParams },
    payload: payload
  }, option.option)

  useEffect(() => {
    const handlePagination = (data?: TableResult<ResultType>) => {
      if (data) {
        setPagination((prev) => ({
          ...prev,
          current: data.page,
          total: data.totalCount
        }))
      }
    }
    handlePagination(api.data)
  }, [api.data])

  const handleTableChange: TableProps<ResultType>['onChange'] = (
    pagination,
    filters,
    sorters
  ) => {
    // Implementation expect there will only be 1 sortable column
    const sorter = Array.isArray(sorters)
      ? sorters[0]
      : sorters

    const sorterKey = Array.isArray(sorter.field) ? sorter.columnKey : sorter.field

    const tableProps = {
      sortField: sorterKey || DEFAULT_SORTER.sortField,
      sortOrder: sorter.order ? transferSorter(sorter.order) : DEFAULT_SORTER.sortOrder,
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    setPayload({ ...payload, ...tableProps })
  }

  return {
    pagination,
    sorter,
    setSorter,
    handleTableChange,
    payload,
    setPayload,
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
  sortOrder: keyof typeof SORTER_ABBR
  page: number
  pageSize: number
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

interface CreateNewTableHttpRequestProps {
  apiInfo: ApiInfo
  params: Params<string> | undefined
  payload: TableChangePayload
}

export function createNewTableHttpRequest (props: CreateNewTableHttpRequestProps) {
  const { apiInfo, params, payload } = props
  return createHttpRequest(apiInfo, { ...params, ...transferPaginationParams(payload) })
}

export function transferTableResult<T> (newResult: NewTableResult<T>): TableResult<T> {
  return {
    data: newResult.content,
    page: newResult.pageable.pageNumber + 1,
    totalCount: newResult.totalElements
  }
}

export function transferPaginationParams (payload: TableChangePayload) {
  const pageSize = payload.pageSize ?? DEFAULT_PAGINATION.pageSize
  const page = payload.page ?? DEFAULT_PAGINATION.page
  const sort = payload.sortField + ',' + payload.sortOrder.toLowerCase()
  return {
    pageSize: pageSize.toString(),
    page: (page - 1).toString(),
    sort
  }
}
