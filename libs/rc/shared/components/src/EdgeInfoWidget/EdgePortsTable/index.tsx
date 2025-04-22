import { useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { find }      from 'lodash'
import { useIntl }   from 'react-intl'

import { Button, ColumnType, Table, TableProps }                        from '@acx-ui/components'
import { EdgeWanLinkHealthDetailsDrawer, EdgeWanLinkHealthStatusLight } from '@acx-ui/edge/components'
import { Features }                                                     from '@acx-ui/feature-toggle'
import { formatter }                                                    from '@acx-ui/formatter'
import {
  defaultSort,
  EdgeLagStatus, EdgeLinkDownCriteriaEnum, EdgeMultiWanProtocolEnum, EdgePortStatus, EdgeStatus,
  EdgeWanLinkHealthStatusEnum,
  getEdgePortDisplayName, getEdgePortIpModeString,
  sortProp,
  transformDisplayOnOff
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

interface EdgePortsTableProps {
  portData: EdgePortStatus[]
  lagData: EdgeLagStatus[]
  handleClickLagName?: () => void,
  isClusterLevel?: boolean
  edgeNodes?: EdgeStatus[]
  filterables?: { [key: string]: ColumnType['filterable'] }
  showDualWanColumns?: boolean
}

interface EdgePortsTableDataType extends EdgePortStatus {
  lagName?: string,
  edgeName?: string,
}

export const EdgePortsTable = (props: EdgePortsTableProps) => {
  const {
    portData, lagData,
    handleClickLagName,
    isClusterLevel = false,
    edgeNodes,
    filterables
  } = props
  const { $t } = useIntl()
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)
  // eslint-disable-next-line max-len
  const [linkHealthDetailIfName, setLinkHealthDetailIfName]= useState<string | undefined>(undefined)

  const showDualWanColumns = isEdgeDualWanEnabled && isDualWanConfigured(portData, lagData)

  const showPortInfo = (portId: string, data:string) => {
    if(lagData?.length > 0) {
      const isLagMember = lagData.some(lag =>
        lag.lagMembers.some(member =>
          member.portId === portId))
      return isLagMember ? '' : data
    }
    return data
  }

  const dualWanColumns: TableProps<EdgePortsTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Link Health Monitoring' }),
      key: 'healthCheckEnabled',
      dataIndex: 'healthCheckEnabled',
      sorter: false,
      render: (_, row) => {
        return <Button type='link'
          onClick={() => {
            setLinkHealthDetailIfName(row.interfaceName)
          }}>
          {transformDisplayOnOff(row.healthCheckEnabled === 'ON')}
        </Button>
      }
    },
    {
      title: $t({ defaultMessage: 'Link Health Status' }),
      key: 'wanLinkStatus',
      dataIndex: 'wanLinkStatus',
      sorter: { compare: sortProp('wanLinkStatus', defaultSort) },
      render: (_, row) => {
        return row.wanLinkStatus
          ? <EdgeWanLinkHealthStatusLight
            status={row.wanLinkStatus as EdgeWanLinkHealthStatusEnum}
            // eslint-disable-next-line max-len
            targetIpStatus={row.wanLinkTargets as { ip: string; status: EdgeWanLinkHealthStatusEnum; }[]}
          />
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'WAN Role' }),
      key: 'wanPortRole',
      dataIndex: 'wanPortRole',
      sorter: { compare: sortProp('wanPortRole', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'WAN Status' }),
      key: 'wanPortStatus',
      dataIndex: 'wanPortStatus',
      sorter: { compare: sortProp('wanPortStatus', defaultSort) }
    }
  ]

  const columns: TableProps<EdgePortsTableDataType>['columns'] = [
    ...(isEdgeDualWanEnabled && isClusterLevel
      ? [{
        title: $t({ defaultMessage: 'Node Name' }),
        key: 'serialNumber',
        dataIndex: 'serialNumber',
        defaultSortOrder: 'ascend' as SortOrder,
        sorter: { compare: sortProp('edgeName', defaultSort) },
        filterable: filterables?.edgeName,
        filterableWidth: 150,
        render: (_: unknown, row: EdgePortsTableDataType) => {
          return <TenantLink to={`/devices/edge/${row.serialNumber}/details/overview`}>
            {row.edgeName}
          </TenantLink>
        }
      }] :[]),
    {
      title: $t({ defaultMessage: 'Port Name' }),
      key: 'interfaceName',
      dataIndex: 'interfaceName',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('interfaceName', defaultSort) },
      searchable: true,
      render: (_, row) => {
        return getEdgePortDisplayName(row as EdgePortStatus)
      }
    },
    ...(isEdgeDualWanEnabled ? [{
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'lagName',
      dataIndex: 'lagName',
      sorter: { compare: sortProp('lagName', defaultSort) },
      render: (_: React.ReactNode, row: EdgePortsTableDataType) => {
        return <Button
          size='small'
          type='link'
          onClick={handleClickLagName}
          children={row.lagName}
        />
      }
    }] : [{
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'name',
      width: 200,
      sorter: { compare: sortProp('name', defaultSort) }
    }]),
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: { compare: sortProp('status', defaultSort) },
      filterable: filterables?.status,
      filterableWidth: 100
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      sorter: { compare: sortProp('adminStatus', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      filterable: filterables?.type,
      filterableWidth: 120,
      render: (_, { portId, type }) => {
        return showPortInfo(portId, type)
      }
    },
    {
      title: $t({ defaultMessage: 'Interface MAC' }),
      key: 'mac',
      dataIndex: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: { compare: sortProp('ip', defaultSort) },
      render: (_, { portId, ip }) => {
        return showPortInfo(portId, ip)
      }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      sorter: { compare: sortProp('ipMode', defaultSort) },
      render: (_, { portId, ipMode }) => {
        const ipModeUpperCase = ipMode.toUpperCase()
        const ipModeStr = getEdgePortIpModeString($t, ipModeUpperCase)
        return showPortInfo(portId, ipModeStr)
      }
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speedKbps',
      dataIndex: 'speedKbps',
      sorter: { compare: sortProp('speedKbps', defaultSort) },
      filterable: filterables?.speedKbps,
      filterableWidth: 100,
      render: (_, row) => {
        return formatter('networkSpeedFormat')(row.speedKbps)
      }
    },
    ...(!isEdgeDualWanEnabled ? [{
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'lagName',
      dataIndex: 'lagName',
      sorter: { compare: sortProp('lagName', defaultSort) },
      render: (_: React.ReactNode, row: EdgePortsTableDataType) => {
        return <Button
          size='small'
          type='link'
          onClick={handleClickLagName}
          children={row.lagName}
        />
      }
    }] : []),
    ...((isEdgeDualWanEnabled && showDualWanColumns) ? dualWanColumns : [])
  ]

  return <>
    <Table
      settingsId='edge-ports-table'
      rowKey='portId'
      columns={columns}
      dataSource={aggregatePortData(portData, lagData, edgeNodes)}
    />
    {isEdgeDualWanEnabled && <EdgeWanLinkHealthDetailsDrawer
      visible={!!linkHealthDetailIfName}
      setVisible={setLinkHealthDetailIfName}
      portName={linkHealthDetailIfName}
      // TODO: test data waiting for IT
      healthCheckPolicy={{
        protocol: EdgeMultiWanProtocolEnum.PING,
        targetIpAddresses: ['8.8.8.8', '11.11.11.11'],
        linkDownCriteria: EdgeLinkDownCriteriaEnum.ANY_TARGET_DOWN,
        intervalSeconds: 2,
        maxCountToDown: 3,
        maxCountToUp: 6
      }}
    />}
  </>
}

const aggregatePortData = (portData: EdgePortStatus[],
  lagData: EdgeLagStatus[], edgeNodes?: EdgeStatus[]): EdgePortsTableDataType[] => {
  return portData.map(portItem => {
    const targetLagData = lagData.find(
      lagItem => lagItem.lagMembers?.some(
        lagMemberItem => lagMemberItem.portId === portItem.portId
      ))
    return {
      ...portItem,
      lagName: targetLagData?.name,
      edgeName: find(edgeNodes, { serialNumber: portItem.serialNumber })?.name
    }
  })
}

const isDualWanConfigured = (portData: EdgePortStatus[], lagData: EdgeLagStatus[]) => {
  const hasDualWanPort = portData.some(portItem => Boolean(portItem.wanPortRole))
  const hasDualWanLag = lagData.some(lagItem => Boolean(lagItem.wanPortRole))

  return hasDualWanPort || hasDualWanLag
}