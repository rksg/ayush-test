import { useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Tooltip,
  showActionModal
} from '@acx-ui/components'
import {
  useDeleteVePortsMutation,
  useGetSwitchRoutedListQuery,
  useGetVenueRoutedListQuery,
  useSwitchDetailHeaderQuery,
  useVenueSwitchSettingQuery
} from '@acx-ui/rc/services'
import {
  isOperationalSwitch,
  useTableQuery,
  VenueMessages,
  VeViewModel
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { SwitchVeDrawer } from './switchVeDrawer'

// TODO: Wait for support venue level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SwitchVeTable ( { isVenueLevel } : {
  isVenueLevel: boolean
}
) {
  const { $t } = useIntl()
  const params = useParams()
  const [cliApplied, setCliApplied] = useState(false)

  const { data: venueSwitchSetting }
    = useVenueSwitchSettingQuery({ params }, { skip: !isVenueLevel })
  const { data: switchDetail }
    = useSwitchDetailHeaderQuery({ params }, { skip: isVenueLevel })

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
    useQuery: isVenueLevel ? useGetVenueRoutedListQuery : useGetSwitchRoutedListQuery,
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
    defaultSortOrder: 'ascend',
    sorter: true,
    fixed: 'left',
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

  useEffect(() => {
    if (switchDetail || venueSwitchSetting) {
      setCliApplied((switchDetail?.cliApplied || venueSwitchSetting?.cliApplied) as boolean)
    }
  }, [switchDetail, venueSwitchSetting])

  const onSelectChange = (keys: React.Key[], rows: VeViewModel[]) => {
    setDeleteButtonTooltip('')
    setDisabledDelete(false)


    const defaultVlanVeList = rows.filter(row => row.defaultVlan === true)

    const defaultVlanVe = _.map(defaultVlanVeList, 'veId')
    const tooltip = defaultVlanVeList.length > 0 ?
      `VE ${defaultVlanVe} ${$t({
        defaultMessage: 'is member of default VLAN that cannot be deleted.'
      })}` : ''
    setDisabledDelete(defaultVlanVeList.length > 0)
    setDeleteButtonTooltip(tooltip)

  }

  const transformData = (data?: VeViewModel[]) => {
    return data?.map((ve: VeViewModel) => ({
      ...ve,
      inactiveRow: !isOperationalSwitch(ve.deviceStatus, ve.syncedSwitchConfig),
      // eslint-disable-next-line max-len
      inactiveTooltip: $t({ defaultMessage: 'The port can not be edited since it is on a switch that is not operational' })
    }))
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
      disabled: disabledDelete || cliApplied,
      tooltip: deleteButtonTooltip || $t(VenueMessages.CLI_APPLIED),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Routed Interface' }),
            entityValue: rows.length === 1 ? (rows[0].name || `VE-${rows[0].veId}`) : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteVePorts({ params, payload: _.map(rows, 'id') })
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
      columns={isVenueLevel ? columns: columns.filter(item => item.key !== 'switchName')}
      dataSource={transformData(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={filterByAccess(rowActions)}
      rowSelection={{
        type: 'checkbox',
        renderCell: (checked, record, index, originNode) => {
          return record?.inactiveRow
            ? <Tooltip title={record?.inactiveTooltip}>{originNode}</Tooltip>
            : originNode
        },
        getCheckboxProps: (record) => ({ disabled: record?.inactiveRow }),
        onChange: onSelectChange
      }}
      actions={filterByAccess([{
        label: $t({ defaultMessage: 'Add VLAN interface (VE)' }),
        disabled: cliApplied,
        tooltip: cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
        onClick: () => {
          setIsEditMode(false)
          setVisible(true) }
      }])}
    />
    {visible && <SwitchVeDrawer
      visible={visible}
      setVisible={setVisible}
      isEditMode={isEditMode}
      isVenueLevel={isVenueLevel}
      editData={editData}
      readOnly={isEditMode && cliApplied}
    />}

  </Loader>

}
