import { useState } from 'react'

import { Col }                    from 'antd'
import { SortOrder }              from 'antd/lib/table/interface'
import { ExpandableConfig }       from 'antd/lib/table/interface'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { 
  Button, GridRow, Loader, 
  NestedTableExpandableDefaultConfig, 
  Table, TableProps,
  ColumnType
 }                                       from '@acx-ui/components'
import { EdgeWanLinkHealthDetailsDrawer }                                                                                       from '@acx-ui/edge/components'
import { Features, useIsSplitOn }                                                                                                             from '@acx-ui/feature-toggle'
import { 
  EdgeLagMemberStatus, EdgeLagStatus, 
  EdgeLagTimeoutEnum, 
  getEdgePortIpModeString, 
  EdgeUrlsInfo, 
  transformDisplayOnOff,
  sortProp,
  defaultSort,
  EdgeWanLinkHealthStatusEnum,
  EdgeStatus,
  EdgeLinkDownCriteriaEnum,
  EdgeMultiWanProtocolEnum
 } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                            from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                                                                           from '@acx-ui/types'
import { hasPermission }                                                                                                        from '@acx-ui/user'
import { getIntl, getOpsApi, noDataDisplay }                                                                                    from '@acx-ui/utils'
import { EdgeWanLinkHealthStatusLight } from '../WanLinkHealthStatusLight'

interface EdgeOverviewLagTableProps {
  isConfigurable: boolean
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
    data, isLoading = false, isConfigurable, 
    isClusterLevel,
    filterables,
    edgeNodes
  } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)
  const isEdgeDualWanEnabled = useIsSplitOn(Features.EDGE_DUAL_WAN_TOGGLE)

  // eslint-disable-next-line max-len
  const [linkHealthDetailIfName, setLinkHealthDetailIfName]= useState<string | undefined>(undefined)

  const dualWanColumns: TableProps<LagsTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Link Health Monitoring' }),
      key: 'wanLinkHealth',
      dataIndex: 'wanLinkHealth',
      sorter: false,
      render: (_, row) => {
        return <Button type='link'
          onClick={() => {
            setLinkHealthDetailIfName(`lag${row.lagId}`)
          }}>
          {transformDisplayOnOff(row?.wanLinkHealth === 'ON')}
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
            status={row.wanLinkStatus}
            targetIpStatus={row.wanLinkTargets}
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

  const columns: TableProps<LagsTableDataType>['columns'] = [
    ...(isEdgeDualWanEnabled && isClusterLevel
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
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
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
    ...(isEdgeDualWanEnabled ? dualWanColumns : [])
  ]

  const navigateToLagConfigPage = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/lags`
    })
  }

  return (
    <GridRow justify='end'>
      <Col span={24}>
        <Loader states={[{ isLoading }]}>
          <Table<LagsTableDataType>
            key='id'
            columns={columns}
            expandable={{
              ...NestedTableExpandableDefaultConfig,
              expandedRowRender: (data) =>
                expandedRowRender(data.lagMembers)
            } as ExpandableConfig<LagsTableDataType>}
            dataSource={convertToLagsTableDataType(data, edgeNodes)}
          />
          { isEdgeDualWanEnabled && <EdgeWanLinkHealthDetailsDrawer
            visible={!!linkHealthDetailIfName}
            setVisible={setLinkHealthDetailIfName}
            portName={linkHealthDetailIfName}
            // TODO: test data waiting for IT
            healthCheckPolicy={{
              protocol: EdgeMultiWanProtocolEnum.PING,
              targetIpAddresses: ['8.8.8.8', '11.11.11.11'],
              linkDownCriteria: EdgeLinkDownCriteriaEnum.ALL_TARGETS_DOWN,
              intervalSeconds: 2,
              maxCountToDown: 3,
              maxCountToUp: 6
            }}
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
      render: (_data, row) => _.capitalize(row.name)
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
        return row.lacpTimeout && `${row.lacpTimeout} (${_.capitalize(row.lacpTimeout)})`
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

const convertToLagsTableDataType = (data: EdgeLagStatus[], edgeNodes: EdgeStatus[] = []):
LagsTableDataType[] => {
  return data.map(item => ({
    ...item,
    key: item.lagId.toString(),
    lagMembers: item.lagMembers?.map(member => ({
      ...member,
      lacpTimeout: item.lacpTimeout
    })),
    edgeName: edgeNodes.find(edge => edge.serialNumber === item.serialNumber)?.name,
  }))
}