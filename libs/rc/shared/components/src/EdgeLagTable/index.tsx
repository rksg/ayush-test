import { ReactNode, useState } from 'react'

import { Col, Row }            from 'antd'
import _, { get, union, uniq } from 'lodash'
import { useIntl }             from 'react-intl'

import { Table, TableProps, Tooltip, showActionModal } from '@acx-ui/components'
import { Features }                                    from '@acx-ui/feature-toggle'
import { CheckMark }                                   from '@acx-ui/icons'
import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeLag,
  EdgeLagStatus,
  EdgePort,
  EdgeSerialNumber,
  EdgeUrlsInfo,
  SubInterface,
  defaultSort,
  getEdgePortDisplayName,
  getEdgePortIpModeString,
  isInterfaceInVRRPSetting,
  sortProp
} from '@acx-ui/rc/utils'
import { EdgeScopes, ScopeKeys }         from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getOpsApi }                     from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { LagDrawer } from './LagDrawer'

interface EdgeLagTableType extends EdgeLag {
  adminStatus: string
}

interface EdgeLagTableProps {
  clusterId?: string
  serialNumber?: EdgeSerialNumber
  lagList?: EdgeLag[]
  lagStatusList?: EdgeLagStatus[]
  portList?: EdgePort[]
  vipConfig?: ClusterNetworkSettings['virtualIpSettings']
  onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>
  onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>
  onDelete: (serialNumber: string, id: string) => Promise<void>
  actionScopes?: { [key in string]: ScopeKeys }
  subInterfaceList?: SubInterface[]
  isClusterWizard?: boolean
  clusterInfo: EdgeClusterStatus
  isSupportAccessPort?: boolean
}

export const EdgeLagTable = (props: EdgeLagTableProps) => {
  const {
    clusterId = '', serialNumber = '', lagList,
    lagStatusList, portList, vipConfig = [],
    onAdd, onEdit, onDelete,
    actionScopes, subInterfaceList,
    isClusterWizard = false,
    clusterInfo, isSupportAccessPort
  } = props
  const { $t } = useIntl()
  const [lagDrawerVisible, setLagDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeLag>()
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  const transToTableData = (edgeLagList?: EdgeLag[], edgeLagStatusList?: EdgeLagStatus[]) => {
    return edgeLagList?.map(item => ({
      ...item,
      adminStatus: edgeLagStatusList?.find(status => status.lagId === item.id)?.adminStatus ?? ''
    })) ?? []
  }

  const columns: TableProps<EdgeLagTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'id',
      dataIndex: 'id',
      render: (_data, row) => {
        return `LAG ${row.id}`
      },
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('id', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      sorter: { compare: sortProp('description', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'LAG Type' }),
      key: 'lagType',
      dataIndex: 'lagType',
      render: (_data, row) => {
        return `${row.lagType} (${_.capitalize(row.lacpMode)})`
      },
      sorter: { compare: sortProp('lagType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (_data, row) => {
        const lagMemberSize = row.lagMembers?.length ?? 0
        return lagMemberSize > 0 ?
          <Tooltip
            title={getToolTipContent(row.lagMembers)}
            children={lagMemberSize}
          /> :
          0
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      sorter: { compare: sortProp('portType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      render: (_data, { ipMode }) => getEdgePortIpModeString($t, ipMode),
      sorter: { compare: sortProp('ipMode', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: { compare: sortProp('ip', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet',
      sorter: { compare: sortProp('subnet', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      render: (_data, row) => {
        return row.adminStatus ? row.adminStatus :
          row.lagEnabled ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
      },
      sorter: { compare: sortProp('adminStatus', defaultSort) }
    },
    ...(
      isEdgeCoreAccessSeparationReady ?
        [
          {
            title: $t({ defaultMessage: 'Core Port' }),
            align: 'center' as const,
            key: 'corePortEnabled',
            dataIndex: 'corePortEnabled',
            render: (_data: ReactNode, row: EdgeLagTableType) => {
              return row.corePortEnabled && <CheckMark width={20} height={20} />
            }
          },
          {
            title: $t({ defaultMessage: 'Access Port' }),
            align: 'center' as const,
            key: 'accessPortEnabled',
            dataIndex: 'accessPortEnabled',
            render: (_data: ReactNode, row: EdgeLagTableType) => {
              return row.accessPortEnabled && <CheckMark width={20} height={20} />
            }
          }
        ]
        : []
    )
  ]

  const getToolTipContent = (
    lagMembers: {
      portId: string,
      portEnabled: boolean
    }[]
  ) => {
    return lagMembers?.map(
      lagMember =>
        <Row>
          <Col>
            {
              `${getEdgePortDisplayName((portList?.find(port =>
                port.id === lagMember.portId)))} (${lagMember.portEnabled ?
                $t({ defaultMessage: 'Enabled' }) :
                $t({ defaultMessage: 'Disabled' })})`
            }
          </Col>
        </Row>

    )
  }

  const openDrawer = (data?: EdgeLagTableType) => {
    setCurrentEditData(data)
    setLagDrawerVisible(true)
  }

  const actionButtons = [
    {
      scopeKey: get(actionScopes, 'add') ?? [EdgeScopes.CREATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.addEdgeLag)],
      label: $t({ defaultMessage: 'Add LAG' }),
      onClick: () => {
        openDrawer()
      },
      disabled: (lagList?.length ?? 0) >= 4
    }
  ]

  const checkInterfacesInVRRPSetting = (rows: EdgeLagTableType[]) => {
    for(let row of rows) {
      if(isInterfaceInVRRPSetting(serialNumber, `lag${row.id}`, vipConfig))
        return true
    }
    return false
  }

  const editPermissionScopes = get(actionScopes, 'edit') ?? [EdgeScopes.UPDATE]
  const deletePermissionScopes = get(actionScopes, 'delete') ?? [EdgeScopes.DELETE]

  const rowActions: TableProps<EdgeLagTableType>['rowActions'] = [
    {
      scopeKey: editPermissionScopes,
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.updateEdgeLag)],
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows) => {
        openDrawer(rows[0])
      }
    },
    {
      scopeKey: deletePermissionScopes,
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteEdgeLag)],
      label: $t({ defaultMessage: 'Delete' }),
      disabled: (rows) => checkInterfacesInVRRPSetting(rows),
      tooltip: (rows) => {
        if(checkInterfacesInVRRPSetting(rows)) {
          return $t({ defaultMessage: 'The LAG configured as VRRP interface cannot be deleted' })
        }
        return ''
      },
      onClick: (rows, clearSelection) => {
        const targetData = rows[0]
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'LAG' }),
            entityValue: `LAG ${targetData.id}`,
            numOfEntities: rows.length
          },
          onOk: () => {
            onDelete(serialNumber, targetData.id.toString()).then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: uniq(union(editPermissionScopes, deletePermissionScopes))
  })

  return (
    <>
      <Table<EdgeLagTableType>
        actions={filterByAccess(actionButtons)}
        dataSource={transToTableData(lagList, lagStatusList)}
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        rowSelection={isSelectionVisible && {
          type: 'radio'
        }}
        rowKey='id'
      />
      <LagDrawer
        clusterId={clusterId}
        serialNumber={serialNumber}
        visible={lagDrawerVisible}
        setVisible={setLagDrawerVisible}
        data={currentEditData}
        portList={portList}
        existedLagList={lagList}
        vipConfig={vipConfig}
        onAdd={onAdd}
        onEdit={onEdit}
        subInterfaceList={subInterfaceList}
        isClusterWizard={isClusterWizard}
        clusterInfo={clusterInfo}
        isSupportAccessPort={isSupportAccessPort}
      />
    </>
  )
}