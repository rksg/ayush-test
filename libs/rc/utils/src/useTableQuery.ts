import React, { useEffect, useState } from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TableProps }        from '@acx-ui/components'
import { useParams, Params } from '@acx-ui/react-router-dom'
import { UseQuery }          from '@acx-ui/types'

export interface RequestPayload <Payload = any> {
  params?: Params<string>
  payload?: Payload
}

export interface TableResult <ResultItemType, ExtraParms = any> {
  data: ResultItemType[]
  page: number
  totalCount: number
  extra?: ExtraParms
}

export interface TABLE_QUERY <
  ResultType = Record<string, unknown>,
  Payload extends RequestPayload = RequestPayload
> {
  defaultPayload: Partial<Payload>
  useQuery: UseQuery<TableResult<ResultType>, { params: Params<string>, payload: Payload }>
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

export function useTableQuery <ResultType, Payload> (option: TABLE_QUERY<ResultType, Payload>) {
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

  const [selectedRowsData, setSelectedRowsData] = useState([] as ResultType[])
  const rowKey = ('id' || option.rowKey) as keyof ResultType

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

  // Select row data
  const rowSelection: TableProps<ResultType>['rowSelection'] = {
    selectedRowKeys: selectedRowsData.map(item => item[rowKey]) as unknown as React.Key[],
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowsData(selectedRows)
    }
  }
  const onRowClick = (row: ResultType) => {
    const rowIndex = selectedRowsData.indexOf(row)
    if (rowIndex === -1) {
      setSelectedRowsData([...selectedRowsData, row])
    } else {
      let tmp = [...selectedRowsData]
      tmp.splice(rowIndex, 1)
      setSelectedRowsData(tmp)
    }
  }

  return {
    pagination,
    sorter,
    setSorter,
    handleTableChange,
    payload,
    setPayload,
    rowSelection,
    onRowClick,
    selectedRowsData,
    ...api
  }
}
