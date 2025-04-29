import { useState } from 'react'

import { Col }                         from 'antd'
import { ExpandableConfig, SortOrder } from 'antd/lib/table/interface'
import { capitalize }                  from 'lodash'
import { useIntl }                     from 'react-intl'

import {
  Button, GridRow, Loader,
  NestedTableExpandableDefaultConfig,
  Table, TableProps,
  ColumnType
}                                       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeLagMemberStatus, EdgeLagStatus,
  EdgeLagTimeoutEnum,
  getEdgePortIpModeString,
  transformDisplayOnOff,
  sortProp,
  defaultSort,
  EdgeStatus,
  EdgeWanLinkHealthStatusEnum,
  EdgeMultiWanConfigStatus
} from '@acx-ui/rc/utils'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { getDisplayWanRole }              from '../utils/dualWanUtils'
import { EdgeWanLinkHealthDetailsDrawer } from '../WanLinkHealthDetails'
import { EdgeWanLinkHealthStatusLight }   from '../WanLinkHealthStatusLight'

interface EdgeOverviewLagTableProps {
  data: EdgeLagStatus[]
  isLoading?: boolean
  isClusterLevel?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
  edgeNodes?: EdgeStatus[]
}

interface LagsTableDataType extends EdgeLagStatus {
  key: string
  lagMembers: LagMemberTableType[],
  edgeName?: string,
}

interface LagMemberTableType extends EdgeLagMemberStatus {
  lacpTimeout: EdgeLagTimeoutEnum
}

export const EdgeOverviewLagTable = (props: EdgeOverviewLagTableProps) => {
  const {
    data, isLoading = false,
    isClusterLevel = false,
    filterables,
    edgeNodes
  } = props
  const { $t } = useIntl()
  const isEdgeDualWanEnabled = useIsSplitOn(Features.EDGE_DUAL_WAN_TOGGLE)

  // eslint-disable-next-line max-len
  const [linkHealthDetailIfName, setLinkHealthDetailIfName]= useState<string | undefined>(undefined)
  // eslint-disable-next-line max-len
  const [linkHealthDetail, setLinkHealthDetail]= useState<EdgeMultiWanConfigStatus | undefined>(undefined)

  // eslint-disable-next-line max-len
  const showDualWanColumns = isEdgeDualWanEnabled && data.some(lagItem => Boolean(lagItem.linkHealthMonitoring))

  const dualWanColumns: TableProps<LagsTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Link Health Monitoring' }),
      key: 'healthCheckEnabled',
      dataIndex: ['linkHealthMonitoring', 'linkHealthMonitorEnabled'],
      sorter: false,
      show: false,
      render: (_, row) => {
        // eslint-disable-next-line max-len
        const result = transformDisplayOnOff(row.linkHealthMonitoring?.linkHealthMonitorEnabled ?? false)

        return row.linkHealthMonitoring?.linkHealthMonitorEnabled
          ? <Button type='link'
            onClick={() => {
              setLinkHealthDetail(row.linkHealthMonitoring)
              setLinkHealthDetailIfName(`lag${row.lagId}`)
            }}>
            {result}
          </Button>
          : result
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
      dataIndex: ['linkHealthMonitoring', 'priority'],
      show: false,
      sorter: { compare: sortProp('wanPortRole', defaultSort) },
      render: (_, row) => {
        return getDisplayWanRole(row.linkHealthMonitoring?.priority ?? 0)
      }
    },
    {
      title: $t({ defaultMessage: 'WAN Status' }),
      key: 'wanPortStatus',
      dataIndex: 'wanPortStatus',
      sorter: { compare: sortProp('wanPortStatus', defaultSort) }
    }
  ]

  const columns: TableProps<LagsTableDataType>['columns'] = [
    ...((isEdgeDualWanEnabled && isClusterLevel)
      ? [{
        title: $t({ defaultMessage: 'Node Name' }),
        key: 'serialNumber',
        dataIndex: 'serialNumber',
        defaultSortOrder: 'ascend' as SortOrder,
        sorter: { compare: sortProp('edgeName', defaultSort) },
        filterable: filterables?.edgeName,
        render: (_: unknown, row: LagsTableDataType) => {
          return <TenantLink to={`/devices/edge/${row.serialNumber}/details/overview`}>
            {row.edgeName}
          </TenantLink>
        }
      }] : []),
    {
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    ...(!isEdgeDualWanEnabled ? [{
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    }] : []),
    {
      title: $t({ defaultMessage: 'LAG Type' }),
      key: 'lagType',
      dataIndex: 'lagType'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (_, row) => {
        return row.lagMembers?.length ?? 0
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType'
    },
    {
      title: $t({ defaultMessage: 'Interface MAC' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      render: (_data, { ipMode }) => getEdgePortIpModeString($t, ipMode)
    },
    ...(showDualWanColumns ? dualWanColumns : [])
  ]

  return (
    <GridRow justify='end'>
      <Col span={24}>
        <Loader states={[{ isLoading }]}>
          <Table<LagsTableDataType>
            settingsId='edge-overview-lag-table'
            columns={columns}
            expandable={{
              ...NestedTableExpandableDefaultConfig,
              expandedRowRender: (data) => {
                return expandedRowRender(data.lagMembers)
              }
            } as ExpandableConfig<LagsTableDataType>}
            dataSource={convertToLagsTableDataType(isClusterLevel, data, edgeNodes)}
          />
          { isEdgeDualWanEnabled && <EdgeWanLinkHealthDetailsDrawer
            visible={!!linkHealthDetailIfName}
            setVisible={setLinkHealthDetailIfName}
            portName={linkHealthDetailIfName}
            data={linkHealthDetail}
          /> }
        </Loader>
      </Col>
    </GridRow>
  )
}

const expandedRowRender = (memberStatus: LagMemberTableType[] = []) => {

  const { $t } = getIntl()

  const columns: TableProps<LagMemberTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Name' }),
      key: 'name',
      dataIndex: 'name',
      render: (_data, row) => capitalize(row.name)
    },
    {
      title: $t({ defaultMessage: 'LACP State' }),
      key: 'state',
      dataIndex: 'state'
    },
    {
      title: $t({ defaultMessage: 'System ID' }),
      key: 'systemId',
      dataIndex: 'systemId'
    },
    {
      title: $t({ defaultMessage: 'Key' }),
      key: 'key',
      dataIndex: 'key',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Timeout' }),
      key: 'lacpTimeout',
      dataIndex: 'lacpTimeout',
      render: (_data, row) => {
        return row.lacpTimeout && `${row.lacpTimeout} (${capitalize(row.lacpTimeout)})`
      }
    },
    {
      title: $t({ defaultMessage: 'Peer System ID' }),
      key: 'peerSystemId',
      dataIndex: 'peerSystemId'
    },
    {
      title: $t({ defaultMessage: 'Peer Key' }),
      key: 'peerKey',
      dataIndex: 'peerKey',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'LACP Rx Count' }),
      key: 'rxCount',
      dataIndex: 'rxCount',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'LACP Tx Count' }),
      key: 'txCount',
      dataIndex: 'txCount',
      align: 'center'
    }
  ]
  return <Table columns={columns} dataSource={memberStatus} stickyHeaders={false} />
}

// eslint-disable-next-line max-len
const convertToLagsTableDataType = (isClusterLevel: boolean, data: EdgeLagStatus[], edgeNodes: EdgeStatus[] | undefined):
LagsTableDataType[] => {
  return data.map(lag => {
    const nodeData = edgeNodes?.find(edge => edge.serialNumber === lag.serialNumber)

    return {
      ...lag,
      key: `${isClusterLevel ? nodeData?.serialNumber : ''}${lag.lagId.toString()}`,
      lagMembers: lag.lagMembers?.map(member => ({
        ...member,
        lacpTimeout: lag.lacpTimeout
      })),
      edgeName: nodeData?.name
    }})
}