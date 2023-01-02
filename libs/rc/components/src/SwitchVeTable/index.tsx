import { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteVePortsMutation, useGetSwitchRoutedListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  VeViewModel
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { SwitchVeDrawer } from './switchVeDrawer'

// TODO: Wait for support venue level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SwitchVeTable ( { isVenueLevel } : {
  isVenueLevel: boolean
}
) {
  const { $t } = useIntl()
  const { tenantId } = useParams()


  const defaultPayload = {
    fields: [
      'portNumber',
      'id',
      'switchId',
      'clientVlan',
      'venueId',
      'deviceStatus',
      'veId',
      'syncedSwitchConfig',
      'defaultVlan',
      'veId',
      'vlanId',
      'name',
      'portType',
      'switchName',
      'ipAddress',
      'ipSubnetMask',
      'ingressAclName',
      'egressAclName']
  }


  const tableQuery = useTableQuery({
    useQuery: useGetSwitchRoutedListQuery, //TODO: support venue level
    defaultPayload,
    sorter: {
      sortField: 'veId',
      sortOrder: 'ASC'
    }
  })

  const [deleteVePorts] = useDeleteVePortsMutation()

  const columns: TableProps<VeViewModel>['columns'] = [{
    key: 'veId',
    title: $t({ defaultMessage: 'VE' }),
    dataIndex: 'veId',
    sorter: true,
    render: function (data) {
      return `VE-${data}`
    }
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    sorter: true
  }, {
    key: 'name',
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    sorter: true
  }, {
    key: 'portType',
    title: $t({ defaultMessage: 'Port Type' }),
    dataIndex: 'portType',
    sorter: true
  }, {
    key: 'switchName',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'ipAddress',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'ipAddress',
    sorter: true
  }, {
    key: 'ipSubnetMask',
    title: $t({ defaultMessage: 'IP Subnet Mask' }),
    dataIndex: 'ipSubnetMask',
    sorter: true
  }, {
    key: 'ingressAclName',
    title: $t({ defaultMessage: 'Ingress ACL' }),
    dataIndex: 'ingressAclName',
    sorter: true
  }, {
    key: 'egressAclName',
    title: $t({ defaultMessage: 'Egress ACL' }),
    dataIndex: 'egressAclName',
    sorter: true
  }]

  const [deleteButtonTooltip, setDeleteButtonTooltip] = useState('')
  const [disabledDelete, setDisabledDelete] = useState(false)

  const onSelectChange = () => {
    setDeleteButtonTooltip('')
    setDisabledDelete(false)
  }


  const rowActions: TableProps<VeViewModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setIsEditMode(true)
        setEditData(selectedRows[0])
        setVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: disabledDelete,
      tooltip: deleteButtonTooltip,
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Routed Interface' }),
            entityValue: rows.length === 1 ? rows[0].name : `VE-${rows[0].veId}`,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteVePorts({ params: { tenantId }, payload: _.map(rows, 'id') })
              .then(clearSelection)
          }
        })
      }
    }
  ]
  const [isEditMode, setIsEditMode] = useState(false)
  const [visible, setVisible] = useState(false)
  const [editData, setEditData] = useState({} as VeViewModel)

  return <Loader states={[tableQuery]}>
    <Table
      columns={columns}
      dataSource={(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='veId'
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox', onChange: onSelectChange }}
      actions={[{
        label: $t({ defaultMessage: 'Add VLAN interface (VE)' }),
        onClick: () => {
          setIsEditMode(false)
          setVisible(true) }
      }]
      }
    />

    <SwitchVeDrawer
      visible={visible}
      setVisible={setVisible}
      isEditMode={isEditMode}
      editData={editData}
    />
  </Loader>

}
