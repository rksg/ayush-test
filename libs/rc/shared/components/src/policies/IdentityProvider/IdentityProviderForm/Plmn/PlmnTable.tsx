import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                    from '@acx-ui/components'
import { IdentityProviderActionType, PlmnType } from '@acx-ui/rc/utils'

import { PLMN_MAX_COUNT }          from '../../constants'
import { updateRowIds }            from '../../utils'
import IdentityProviderFormContext from '../IdentityProviderFormContext'


import PlmnDrawer from './PlmnDrawer'


const PlmnTable = () => {
  const { $t } = useIntl()

  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)

  const [tableData, setTableData] = useState<PlmnType[]>([])

  useEffect(() => {
    const plmns = state?.plmns
    if (plmns) {
      const newData = updateRowIds<PlmnType>(plmns)
      setTableData(newData)
    }
  }, [state])

  const columns: TableProps<PlmnType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Mobile Country Code (MCC)' }),
      dataIndex: 'mcc',
      key: 'mcc'
    }, {
      title: $t({ defaultMessage: 'Mobile Network Code (MNC)' }),
      dataIndex: 'mnc',
      key: 'mnc'
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add PLMN' }),
      disabled: drawerVisible || tableData?.length === PLMN_MAX_COUNT,
      onClick: () => {
        setDrawerVisible(true)
        setEditIndex(-1)
      }
    }
  ]

  const rowActions: TableProps<PlmnType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows: PlmnType[]) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectData = { ...selectedRows[0] }
      setDrawerVisible(true)
      setEditIndex(selectData.rowId!)

      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    visible: (selectedRows: PlmnType[]) => selectedRows.length > 0,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      dispatch({
        type: IdentityProviderActionType.DELETE_PLMN,
        payload: {
          rowIds: selectedRows.map(row => row.rowId!)
        }
      })

      clearSelection()
    }
  }]

  return (
    <>
      <PlmnDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        editIndex={editIndex}
      />
      <Table<PlmnType>
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
export default PlmnTable