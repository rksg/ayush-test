import { useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Table, TableProps }                         from '@acx-ui/components'
import { LldpQosModel, QOS_APP_Type, QOS_VLAN_Type } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                 from '@acx-ui/user'

import { EditLldpModal } from './editLldpModal'

export function LldpQOSTable (props : {
  editable: boolean,
  vlansOptions: DefaultOptionType[],
  lldpModalvisible: boolean,
  lldpQosList: LldpQosModel[],
  setLldpModalvisible: (visible: boolean) => void,
  setLldpQosList: (data: LldpQosModel[]) => void
}) {
  const { $t } = useIntl()
  const {
    editable,
    lldpQosList,
    setLldpQosList,
    vlansOptions
  } = props

  const [lldpModalvisible, setLldpModalvisible] = useState(false)
  const [editRowId, setEditRowId] = useState('')

  const applicationTypeMap: { [key: string]: string }
  = Object.entries(QOS_APP_Type)
    .reduce((result, [value, key]: [string, string]) => {
      return { ...result, [key]: value }
    }, {})

  const qosVlanTypeMap: { [key: string]: string }
  = Object.entries(QOS_VLAN_Type)
    .reduce((result, [value, key]: [string, string]) => {
      return { ...result, [key]: value }
    }, {})

  const columns: TableProps<LldpQosModel>['columns'] = [{
    key: 'applicationType',
    title: $t({ defaultMessage: 'Application Type' }),
    width: 150,
    dataIndex: 'applicationType',
    defaultSortOrder: 'ascend',
    render: (_, { applicationType }) => applicationTypeMap[applicationType]
  }, {
    key: 'qosVlanType',
    title: $t({ defaultMessage: 'QoS VLAN Type' }),
    width: 125,
    dataIndex: 'qosVlanType',
    render: (_, { qosVlanType }) => qosVlanTypeMap[qosVlanType]
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId'
  }, {
    key: 'priority',
    title: $t({ defaultMessage: 'Priority' }),
    dataIndex: 'priority'
  }, {
    key: 'dscp',
    title: $t({ defaultMessage: 'DSCP' }),
    dataIndex: 'dscp'
  }]

  const rowActions: TableProps<LldpQosModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      disabled: !editable,
      onClick: (selectedRows) => {
        setLldpModalvisible(true)
        setEditRowId(selectedRows?.[0]?.id)
      }
    },
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Delete' }),
      disabled: !editable,
      onClick: (rows, clearSelection) => {
        setLldpQosList(lldpQosList.filter(lldp => lldp.id !== rows?.[0]?.id))
        clearSelection()
      }
    }]

  return <>
    <Table
      columns={columns}
      dataSource={lldpQosList}
      rowActions={filterByAccess(rowActions)}
      pagination={false}
      rowKey='id'
      rowSelection={hasAccess() && {
        type: 'radio',
        alwaysShowAlert: true
      }}
    />
    {
      lldpModalvisible && <EditLldpModal
        isEditMode={true}
        editRowId={editRowId}
        setLldpModalvisible={setLldpModalvisible}
        lldpModalvisible={lldpModalvisible}
        lldpQosList={lldpQosList}
        setLldpQosList={setLldpQosList}
        vlansOptions={vlansOptions}
      />
    }
  </>
}
