import React, { useEffect, useState } from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TableProps }        from '@acx-ui/components'
import { useParams, Params } from '@acx-ui/react-router-dom'
import { UseQuery }          from '@acx-ui/types'

export interface RequestPayload <Payload = any> {
  params?: Params<string>
  payload?: Payload
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
  pagination?: PAGINATION
  sorter?: SORTER
  rowKey?: string
}
export interface PAGINATION {
  current: number,
  pageSize: number,
  total: number
}

const DEFAULT_PAGINATION = {
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

export function useTableQuery <
  ResultType,
  Payload,
  ResultExtra
> (option: TABLE_QUERY<ResultType, Payload, ResultExtra>) {
  const [pagination, setPagination] = useState({
    ...DEFAULT_PAGINATION,
    ...(option?.pagination || {})
  })
  const [sorter, setSorter] = useState({
    ...DEFAULT_SORTER,
    ...(option?.sorter || {})
  })
  const [payload, setPayload] = useState({
    ...option.defaultPayload,
    ...(pagination as unknown as Partial<Payload>),
    ...(sorter as unknown as Partial<Payload>)
  })

  // RTKQuery
  const api = option.useQuery({
    params: { ...useParams(), ...option.apiParams },
    payload: payload as Payload
  })

  useEffect(() => {
    const handlePagination = (data?: TableResult<ResultType>) => {
      if (data) {
        setPagination({
          ...DEFAULT_PAGINATION,
          current: data.page,
          total: data.totalCount
        })
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

    const tableProps = {
      sortField: sorter.field || DEFAULT_SORTER.sortField,
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
  }
}
