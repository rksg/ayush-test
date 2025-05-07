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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useDeleteVePortsMutation,
  useGetSwitchRoutedListQuery,
  useGetVenueRoutedListQuery,
  useSwitchDetailHeaderQuery,
  useVenueSwitchSettingQuery
} from '@acx-ui/rc/services'
import {
  VenueMessages,
  useTableQuery,
  VeViewModel,
  SwitchViewModel,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { isOperationalSwitch }         from '@acx-ui/rc/switch/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { SwitchScopes }                  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getOpsApi }                     from '@acx-ui/utils'

import { SwitchVeDrawer } from './switchVeDrawer'
// TODO: Wait for support venue level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SwitchVeTable (props: {
  isVenueLevel: boolean,
  switchInfo?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const params = useParams()
  const { isVenueLevel, switchInfo } = props
  const [cliApplied, setCliApplied] = useState(false)
  const isSwitchV6AclEnabled = useIsSplitOn(Features.SUPPORT_SWITCH_V6_ACL)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { data: switchDetail }
    = useSwitchDetailHeaderQuery({
      params: { switchId: params.switchId, venueId: switchInfo?.venueId || '' },
      enableRbac: isSwitchRbacEnabled
    }, { skip: isVenueLevel })

  const { data: venueSwitchSetting }
      = useVenueSwitchSettingQuery({
        params, enableRbac: isSwitchRbacEnabled
      }, { skip: !isVenueLevel })

  const defaultPayload = {
    fields: [
      'portNumber',
      'id',
      'switchId',
      'clientVlan',
      'connectedVe',
      'venueId',
      'deviceStatus',
      'veId',
      'syncedSwitchConfig',
      'veId',
      'vlanId',
      'name',
      'portType',
      'switchName',
      'ipAddress',
      'ipSubnetMask',
      'ingressAclName',
      'egressAclName',
      'vsixIngressAclName',
      'vsixEgressAclName'
    ]
  }


  const tableQuery = useTableQuery({
    useQuery: isVenueLevel ? useGetVenueRoutedListQuery : useGetSwitchRoutedListQuery,
    apiParams: isVenueLevel ? {} : { venueId: switchInfo?.venueId || '' },
    defaultPayload,
    enableRbac: isSwitchRbacEnabled,
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
    render: function (_, { veId }) {
      return `VE-${veId}`
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
    title: $t({ defaultMessage: 'Ingress ACL (IPv4)' }),
    dataIndex: 'ingressAclName',
    sorter: true
  }, {
    key: 'egressAclName',
    title: $t({ defaultMessage: 'Egress ACL (IPv4)' }),
    dataIndex: 'egressAclName',
    sorter: true
  },
  ...(isSwitchV6AclEnabled ? [{
    key: 'vsixIngressAclName',
    title: $t({ defaultMessage: 'Ingress ACL (IPv6)' }),
    dataIndex: 'vsixIngressAclName',
    sorter: true,
    show: false
  }, {
    key: 'vsixEgressAclName',
    title: $t({ defaultMessage: 'Egress ACL (IPv6)' }),
    dataIndex: 'vsixEgressAclName',
    sorter: true,
    show: false
  }] : [])
  ]

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


    const connectedVeList = rows.filter(row => row.connectedVe === true)

    const connectedVeId = _.map(connectedVeList, 'veId')
    const tooltip = connectedVeList.length > 0 ?
      `VE ${connectedVeId} ${$t({
        defaultMessage: 'is member of default VLAN that cannot be deleted.'
      })}` : ''
    setDisabledDelete(connectedVeList.length > 0)
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
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateVePort)],
      onClick: (selectedRows) => {
        setIsEditMode(true)
        setEditData(selectedRows[0])
        setVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteVePorts)],
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
          onOk: async () => {
            if (isSwitchRbacEnabled) {

              try {
                const switchGroups = _.groupBy(rows, 'switchId')
                const requests = Object.keys(switchGroups).map(
                  key => ({
                    params: {
                      venueId: (isVenueLevel ? params.venueId : switchInfo?.venueId) || '',
                      switchId: key
                    },
                    payload: switchGroups[key].map(item => item.id)
                  }))

                const requestList = requests.map((requests) => {
                  return deleteVePorts({
                    params: requests.params,
                    payload: requests.payload,
                    enableRbac: isSwitchRbacEnabled
                  }).unwrap()
                })
                await Promise.all(requestList).then(clearSelection)

              } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error)
              }
            } else {
              deleteVePorts({
                params,
                payload: _.map(rows, 'id'),
                enableRbac: isSwitchRbacEnabled
              }).then(clearSelection)
            }
          }
        })
      }
    }
  ]
  const [isEditMode, setIsEditMode] = useState(false)
  const [visible, setVisible] = useState(false)
  const [editData, setEditData] = useState({} as VeViewModel)

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE],
    rbacOpsIds: [
      getOpsApi(SwitchRbacUrlsInfo.updateVePort),
      getOpsApi(SwitchRbacUrlsInfo.deleteVePorts)
    ]
  })

  const isActionHidden = (data?: VeViewModel[]) => {
    return !isVenueLevel && switchDetail?.model?.startsWith('ICX8100')
      && (data?.length || 0) > 0
  }

  return <Loader states={[tableQuery]}>
    <Table
      settingsId='switch-ve-table'
      columns={isVenueLevel ? columns: columns.filter(item => item.key !== 'switchName')}
      dataSource={transformData(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={filterByAccess(rowActions)}
      rowSelection={isSelectionVisible ? {
        type: 'checkbox',
        renderCell: (checked, record, index, originNode) => {
          return record?.inactiveRow
            ? <Tooltip title={record?.inactiveTooltip}>{originNode}</Tooltip>
            : originNode
        },
        getCheckboxProps: (record) => ({ disabled: record?.inactiveRow }),
        onChange: onSelectChange
      } : undefined}
      actions={isActionHidden(tableQuery.data?.data) ? [] :
        filterByAccess([{
          label: $t({ defaultMessage: 'Add VLAN interface (VE)' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addVePort)],
          disabled: cliApplied,
          tooltip: cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
          onClick: () => {
            setIsEditMode(false)
            setEditData({} as VeViewModel)
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
      switchInfo={props.switchInfo}
    />}

  </Loader>

}
