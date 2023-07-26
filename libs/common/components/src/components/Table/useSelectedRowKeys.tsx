import { Key, useEffect, useState } from 'react'

import { TableProps } from 'antd'

export function useSelectedRowKeys <RecordType> (
  rowSelection?: TableProps<RecordType>['rowSelection']
): [Key[], React.Dispatch<React.SetStateAction<Key[]>>,
  RecordType[], React.Dispatch<React.SetStateAction<RecordType[]>>,
  RecordType[], React.Dispatch<React.SetStateAction<RecordType[]>>
] {
  const [selectedRowKeys, setSelectedRowKeys]
    = useState<Key[]>(rowSelection?.defaultSelectedRowKeys ?? [])
  const [selectedRows, setSelectedRows]
    = useState<RecordType[]>([])
  const [allRows, setAllRows]
    = useState<RecordType[]>([])

  useEffect(() => {
    if (rowSelection?.selectedRowKeys !== undefined) {
      setSelectedRowKeys(rowSelection?.selectedRowKeys)
    }
    if (rowSelection?.selectedRowKeys?.length === 0) {
      setSelectedRows([])
      setAllRows([])
    }
  }, [rowSelection?.selectedRowKeys])

  return [selectedRowKeys, setSelectedRowKeys, selectedRows, setSelectedRows, allRows, setAllRows]
}