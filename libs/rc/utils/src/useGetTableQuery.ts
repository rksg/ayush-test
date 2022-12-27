import { Key, useEffect, useState } from 'react'

import { TableProps }        from 'antd'
import { isEqual }           from 'lodash'
import { Params, useParams } from 'react-router-dom'

import { UseQuery, UseQueryResult } from '@acx-ui/types'

import { PaginationQueryResult }                                          from './types'
import { usePrevious }                                                    from './usePrevious'
import { DEFAULT_PAGINATION, DEFAULT_SORTER, PAGINATION, transferSorter } from './useTableQuery'

interface TABLE_QUERY <
  ResultType = Record<string, unknown>,
> {
  useQuery: UseQuery<
    PaginationQueryResult<ResultType>,
    { params: Params<string>, queryArgs: QueryPagination & SORTER }
  >
  apiParams?: Record<string, string>
  pagination?: Partial<PAGINATION>
  sorter?: SORTER
  rowKey?: string
  pollingInterval?: number
}

interface TableQuery<ResultType>
  extends UseQueryResult<PaginationQueryResult<ResultType>> {
  pagination: PAGINATION,
  setPagination: React.Dispatch<React.SetStateAction<PAGINATION>>
  sorter: SORTER,
  setSorter: React.Dispatch<React.SetStateAction<SORTER>>,
  handleTableChange: TableProps<ResultType>['onChange'],
}

interface SORTER {
  sortField: Key | readonly Key[] | string,
  sortOrder: string
}

interface QueryPagination extends Omit<PAGINATION, 'total'> {
}

export interface QueryArgs {
  queryArgs: PAGINATION & SORTER
}

export function useGetTableQuery <
  ResultType
> (option: TABLE_QUERY<ResultType>) {

  const initialPagination = {
    ...DEFAULT_PAGINATION,
    ...(option?.pagination || {})
  }

  const initialSorter = {
    ...DEFAULT_SORTER,
    ...(option?.sorter || {})
  }

  const initialQueryPagination = {
    current: initialPagination.current,
    pageSize: initialPagination.pageSize
  }

  const [queryPagination, setQueryPagination] = useState<QueryPagination>(initialQueryPagination)
  const [pagination, setPagination] = useState<PAGINATION>(initialPagination)
  const [sorter, setSorter] = useState<SORTER>(initialSorter)
  const prevApiParams = usePrevious(option.apiParams)

  const params = useParams()
  // RTKQuery

  const pollingInterval = option.pollingInterval ? {
    pollingInterval: option.pollingInterval
  } : {}

  const api = option.useQuery({
    params: { ...params, ...option.apiParams },
    queryArgs: { ...queryPagination, ...sorter }
  }, pollingInterval)

  useEffect(() => {
    if(!isEqual(prevApiParams, option.apiParams)) {
      setQueryPagination(initialQueryPagination)
    }
  }, [option.apiParams, prevApiParams])

  useEffect(() => {
    const handlePagination = (data?: PaginationQueryResult<ResultType>) => {
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

    setQueryPagination({
      current: pagination.current || DEFAULT_PAGINATION.current,
      pageSize: pagination.pageSize || DEFAULT_PAGINATION.pageSize
    })
    setPagination({
      current: pagination.current || DEFAULT_PAGINATION.current,
      pageSize: pagination.pageSize || DEFAULT_PAGINATION.pageSize
    })
    setSorter({
      sortField: sorterKey || DEFAULT_SORTER.sortField,
      sortOrder: sorter.order ? transferSorter(sorter.order) : DEFAULT_SORTER.sortOrder
    })
  }

  return {
    pagination,
    setPagination,
    sorter,
    setSorter,
    handleTableChange,
    ...api
  } as TableQuery<ResultType>
}