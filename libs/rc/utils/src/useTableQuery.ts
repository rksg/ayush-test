import { useEffect, useState } from 'react'

export interface TABLE_QUERY {
  defaultPayload: any,
  api: any,
  apiParams?:any,
  pagination?: PAGINATION,
  sorter?: SORTER,
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

const DEFAULT_ARRAY:any[] = []

const transferSorter = (order:string) => {
  return order === 'ascend' ? SORTER_ABBR.ascend : SORTER_ABBR.descend
}

export const useTableQuery = (option: TABLE_QUERY) => {
  const [pagination, setPagination] = useState({ 
    ...DEFAULT_PAGINATION, ...(option?.pagination || {}) 
  })
  const [sorter, setSorter] = useState({ 
    ...DEFAULT_SORTER, ...(option?.sorter || {}) })
  const [payload, setPayload] = useState({ ...option.defaultPayload, ...pagination, ...sorter })

  const [selectedRowsData, setSelectedRowsData] = useState(DEFAULT_ARRAY)
  const rowKey = 'id' || option.rowKey

  // RTKQuery
  const api = option.api({ params: option.apiParams, payload })
  const refetch = api.refetch
  
  useEffect(() => { 
    const handlePagination = (data:any) => {
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
  useEffect(refetch, [payload, refetch])

  const handleTableChange = (pagination:any, filters:any, sorter:any) => {
    const tableProps = {
      sortField: sorter.field || DEFAULT_SORTER.sortField,
      sortOrder: sorter.order ? transferSorter(sorter.order) : DEFAULT_SORTER.sortOrder,
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    setPayload({ ...payload, ...tableProps })
  }

  // Select row data
  const rowSelection = {
    selectedRowKeys: selectedRowsData.map(item => item[rowKey]),
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowsData(selectedRows)
    }
  }
  const onRowClick = (row:any) => {
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
