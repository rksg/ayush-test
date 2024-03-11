import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                              from '@acx-ui/components'
import { IdentityProviderActionType, RoamConsortiumType } from '@acx-ui/rc/utils'

import { updateRowId }             from '../../utils'
import IdentityProviderFormContext from '../IdentityProviderFormContext'

import RoamConsortiumOiDrawer from './RoamConsortiumOiDrawer'



const RoamConsortiumOiTable = () => {
  const { $t } = useIntl()

  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)

  const [tableData, setTableData] = useState<RoamConsortiumType[]>([])

  useEffect(() => {
    const rois = state?.roamConsortiumOIs
    if (rois) {
      const newData = updateRowId<RoamConsortiumType>(rois)
      setTableData(newData)
    }
  }, [state])

  const columns: TableProps<RoamConsortiumType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name'
    }, {
      title: $t({ defaultMessage: 'Organization Id' }),
      dataIndex: 'organizationId',
      key: 'organizationId'
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add OI' }),
      disabled: drawerVisible,
      onClick: () => {
        setDrawerVisible(true)
        setEditIndex(-1)
      }
    }
  ]

  const rowActions: TableProps<RoamConsortiumType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows: RoamConsortiumType[]) => selectedRows.length === 1,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      const selectData = { ...selectedRows[0] }
      setDrawerVisible(true)
      setEditIndex(selectData.rowId!)

      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    visible: (selectedRows: RoamConsortiumType[]) => selectedRows.length > 0,
    disabled: drawerVisible,
    onClick: (selectedRows, clearSelection) => {
      dispatch({
        type: IdentityProviderActionType.DELETE_ROI,
        payload: {
          rowIds: selectedRows.map(row => row.rowId!)
        }
      })

      clearSelection()
    }
  }]

  return (
    <>
      <RoamConsortiumOiDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        editIndex={editIndex}
      />
      <Table<RoamConsortiumType>
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

export default RoamConsortiumOiTable