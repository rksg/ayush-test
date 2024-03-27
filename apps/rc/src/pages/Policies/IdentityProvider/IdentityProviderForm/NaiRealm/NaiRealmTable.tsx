
import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import {
  IdentityProviderActionType,
  NaiRealmEcodingDisplayMap,
  NaiRealmType
} from '@acx-ui/rc/utils'

import { updateRowIds }            from '../../utils'
import IdentityProviderFormContext from '../IdentityProviderFormContext'

import NaiRealmDrawer from './NaiRealmDrawer'


const NaiRealmTable = () => {
  const { $t } = useIntl()

  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)

  const [tableData, setTableData] = useState<NaiRealmType[]>([])


  useEffect(() => {
    const naiRealms = state?.naiRealms
    if (naiRealms) {
      const newData = updateRowIds<NaiRealmType>(naiRealms)
      setTableData(newData)
    }
  }, [state])

  const columns: TableProps<NaiRealmType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Realm Name' }),
      dataIndex: 'name',
      key: 'name'
    }, {
      title: $t({ defaultMessage: 'Encoding' }),
      dataIndex: 'encoding',
      key: 'encoding',
      render: (_, row) => {
        return $t(NaiRealmEcodingDisplayMap[row.encoding])
      }
    }, {
      title: $t({ defaultMessage: 'EAP Method' }),
      dataIndex: 'eaps',
      key: 'eaps',
      align: 'center',
      render: (_, row) => {
        const { eaps } = row
        return eaps? eaps.length : ''
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Realm' }),
      disabled: drawerVisible,
      onClick: () => {
        setDrawerVisible(true)
        setEditIndex(-1)
      }
    }
  ]

  const rowActions: TableProps<NaiRealmType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows: NaiRealmType[]) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectData = { ...selectedRows[0] }
      setDrawerVisible(true)
      setEditIndex(selectData.rowId!)

      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    visible: (selectedRows: NaiRealmType[]) => selectedRows.length > 0,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      dispatch({
        type: IdentityProviderActionType.DELETE_REALM,
        payload: {
          rowIds: selectedRows.map(row => row.rowId!)
        }
      })

      clearSelection()
    }
  }]

  return (
    <>
      <NaiRealmDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        editIndex={editIndex}
      />
      <Table<NaiRealmType>
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

export default NaiRealmTable