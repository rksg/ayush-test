import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                    from '@acx-ui/components'
import { EapType, NaiRealmEapMethodDisplayMap } from '@acx-ui/rc/utils'

import { EAP_MAX_COUNT } from '../../constants'
import { updateRowId }   from '../../utils'

import EapDrawer from './EapDrawer'

export type drawerEapMethodStateType = {
    visible: boolean,
    currentData?: EapType
}

type EapTableProps = {
  data: EapType[] | undefined,
  setData: (d: EapType[]) => void
}

const EapTable = (props: EapTableProps) => {
  const { $t } = useIntl()

  const { data, setData } = props

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)

  const [tableData, setTableData] = useState<EapType[]>([])

  useEffect(() => {
    if (data) {
      const newData = updateRowId<EapType>(data)
      setTableData(newData)
    }
  }, [data])


  const columns: TableProps<EapType>['columns'] = [
    {
      title: '#',
      dataIndex: 'rowId',
      key: 'rowId',
      align: 'center',
      width: 20,
      render: (_, row) => {
        return (row?.rowId !== undefined) ? row?.rowId+1 : ''
      }
    }, {
      title: $t({ defaultMessage: 'EAP Method' }),
      dataIndex: 'method',
      key: 'method',
      width: 140,
      render: (_, row) => {
        return $t(NaiRealmEapMethodDisplayMap[row.method])
      }
    }, {
      title: $t({ defaultMessage: 'Auth' }),
      dataIndex: 'AuthInfoCount',
      key: 'AuthInfoCount',
      align: 'center',
      width: 40,
      render: (_, row) => {
        return row?.authInfos?.length || 0
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add EAP Method' }),
      disabled: drawerVisible || tableData?.length === EAP_MAX_COUNT,
      onClick: () => {
        setDrawerVisible(true)
        setEditIndex(-1)
      }
    }
  ]

  const rowActions: TableProps<EapType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows: EapType[]) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectData = { ...selectedRows[0] }
      setDrawerVisible(true)
      setEditIndex(selectData.rowId!)

      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    visible: (selectedRows: EapType[]) => selectedRows.length > 0,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const rowIds = selectedRows.map(row => row.rowId!)
      const newData = tableData.filter(r => rowIds.indexOf(r.rowId!) === -1)
      setData(newData)

      clearSelection()
    }
  }]

  return (
    <>
      <EapDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        editIndex={editIndex}
        dataList={tableData}
        updateDataList={setData}
      />

      <Table<EapType>
        columns={columns}
        dataSource={tableData}
        actions={actions}
        rowActions={rowActions}
        rowKey='rowId'
        rowSelection={{ type: 'radio' }}
      />
    </>
  )
}

export default EapTable