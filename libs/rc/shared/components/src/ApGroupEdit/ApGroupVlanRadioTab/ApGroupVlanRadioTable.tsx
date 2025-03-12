import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { Network }           from '@acx-ui/rc/utils'
import { filterByAccess }    from '@acx-ui/user'

import { useApGroupNetworkColumns } from '../../ApGroupNetworkTable'

import { ApGroupVlanRadioContext } from './index'


export function ApGroupVlanRadioTable () {
  const { $t } = useIntl()
  const { apGroupId, venueId,
    tableData, vlanPoolingNameMap,
    drawerStatus, setDrawerStatus } = useContext(ApGroupVlanRadioContext)

  const columns = useApGroupNetworkColumns(apGroupId, venueId, vlanPoolingNameMap, true)

  const rowActions: TableProps<Network>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => rows.length === 1,
    disabled: drawerStatus?.visible,
    onClick: (rows) => {
      setDrawerStatus({
        visible: true,
        editData: rows[0]
      })
    }
  }]

  return (
    <Table
      settingsId='apgroup-vlan-radio-table'
      columns={columns}
      dataSource={tableData}
      rowKey='id'
      rowActions={filterByAccess(rowActions)}
      rowSelection={{ type: 'radio' ,
        getCheckboxProps: (record) => {
          return {
            disabled: record.isOweMaster === false && record.owePairNetworkId !== undefined
          }
        }
      }}
    />
  )
}
