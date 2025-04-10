import { Col }                    from 'antd'
import { ExpandableConfig }       from 'antd/lib/table/interface'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, GridRow, Loader, NestedTableExpandableDefaultConfig, Table, TableProps }                from '@acx-ui/components'
import { EdgeLagMemberStatus, EdgeLagStatus, EdgeLagTimeoutEnum, getEdgePortIpModeString, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                 from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                                                    from '@acx-ui/types'
import { hasPermission }                                                                                 from '@acx-ui/user'
import { getIntl, getOpsApi }                                                                            from '@acx-ui/utils'

interface LagsTabProps {
  isConfigurable: boolean
  data: EdgeLagStatus[]
  isLoading?: boolean
}

interface LagsTableDataType extends EdgeLagStatus {
  key: string
  lagMembers: LagMemberTableType[]
}

interface LagMemberTableType extends EdgeLagMemberStatus {
  lacpTimeout: EdgeLagTimeoutEnum
}

export const LagsTab = (props: LagsTabProps) => {

  const { data, isLoading = false, isConfigurable } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)

  const columns: TableProps<LagsTableDataType>['columns'] = [
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
    }
  ]

  const navigateToLagConfigPage = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/lags`
    })
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.addEdgeLag),
      getOpsApi(EdgeUrlsInfo.updateEdgeLag),
      getOpsApi(EdgeUrlsInfo.deleteEdgeLag)
    ]
  })

  return (
    <GridRow justify='end'>
      {hasUpdatePermission && isConfigurable &&
      <Button
        size='small'
        type='link'
        onClick={navigateToLagConfigPage}
      >
        {$t({ defaultMessage: 'Configure LAG Settings' })}
      </Button>
      }
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
            dataSource={convertToLagsTableDataType(data)}
          />
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

const convertToLagsTableDataType = (data: EdgeLagStatus[]):
LagsTableDataType[] => {
  return data.map(item => ({
    ...item,
    key: item.lagId.toString(),
    lagMembers: item.lagMembers?.map(member => ({
      ...member,
      lacpTimeout: item.lacpTimeout
    }))
  }))
}
