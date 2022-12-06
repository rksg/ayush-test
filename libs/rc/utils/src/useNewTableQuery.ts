import { useEffect, useState } from 'react'


// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TableProps }        from '@acx-ui/components'
import { useParams, Params } from '@acx-ui/react-router-dom'
import { UseQuery }          from '@acx-ui/types'


interface RequestPayload <Payload = any> extends Record<string,any> {
  params?: Params<string>
  payload?: Payload
}

export interface NewTableResult <ResultItemType, ResultExtra = unknown> {
  content: ResultItemType[],
  size: number,
  number: number
  totalElements: number
  extra?: ResultExtra
}

export interface NEW_TABLE_QUERY <
  ResultType = Record<string, unknown>,
  Payload extends RequestPayload = RequestPayload,
  ResultExtra = unknown
  > {
  defaultPayload: Partial<Payload>
  useQuery: UseQuery<
    NewTableResult<ResultType, ResultExtra>,
    { params: Params<string>, payload: Payload }
    >
  apiParams?: Record<string, string>
  pagination?: Partial<PAGINATION>
  sorter?: SORTER
  rowKey?: string,
  skip?: boolean
}

interface PARAMS {
  page: string,
  size: string
}

const DEFAULT_PARAMS: PARAMS = {
  page: '0',
  size: '10'
}

interface PAGINATION {
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

interface SORTER {
  sortField: string,
  sortOrder: string
}

const DEFAULT_SORTER = {
  // sort: 'name,' + SORTER_ABBR.ascend,
  sortField: 'name',
  sortOrder: SORTER_ABBR.ascend
}

const transferSorter = (order:string) => {
  return order === 'ascend' ? SORTER_ABBR.ascend : SORTER_ABBR.descend
}

export function useNewTableQuery <
  ResultType,
  Payload,
  ResultExtra
  > (option: NEW_TABLE_QUERY<ResultType, Payload, ResultExtra>) {
  const [apiParams, setApiParams] = useState({
    ...DEFAULT_PARAMS,
    ...option.apiParams || {}
  })
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
    // ...(apiParams as unknown as Partial<Payload>)
  })

  // console.log('Option = ', option)

  // RTKQuery
  const api = option.useQuery( {
    params: { ...useParams(), ...apiParams },
    payload: payload as Payload
  },{ skip: option?.skip })

  useEffect(() => {
    const handlePagination = (data?: NewTableResult<ResultType>) => {
      if (data) {
        setPagination({
          ...DEFAULT_PAGINATION,
          current: data.number + 1,
          total: data.totalElements,
          pageSize: data.size
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
    console.log('[handleTableChange] pagination = ', pagination)

    // Implementation expect there will only be 1 sortable column
    const sorter = Array.isArray(sorters)
      ? sorters[0]
      : sorters

    const sorterKey = Array.isArray(sorter.field) ? sorter.columnKey : sorter.field

    const tableProps = {
      sortField: sorterKey || DEFAULT_SORTER.sortField,
      sortOrder: sorter.order ? transferSorter(sorter.order) : DEFAULT_SORTER.sortOrder,
      // sort: `${sorter.field},${sorter.order ? transferSorter(sorter.order) : DEFAULT_SORTER.sortOrder}`,
      page: pagination.current,
      size: pagination.pageSize
    }

    const currentPage = pagination?.current ? pagination.current - 1 : 0

    setApiParams({
      ...apiParams,
      page: `${currentPage}`,
      size: `${pagination.pageSize}`
    })
    console.log('[HandleTableChange] :: TableProps: ', tableProps, ' -- payload: ', payload)
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
