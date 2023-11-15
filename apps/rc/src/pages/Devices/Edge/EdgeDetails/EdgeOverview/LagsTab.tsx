import { Col }                    from 'antd'
import { ExpandableConfig }       from 'antd/lib/table/interface'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, GridRow, Loader, NestedTableExpandableDefaultConfig, Table, TableProps } from '@acx-ui/components'
import { EdgeIpModeEnum, EdgeLagMemberStatus, EdgeLagStatus }                             from '@acx-ui/rc/utils'
import { useTenantLink }                                                                  from '@acx-ui/react-router-dom'
import { hasAccess }                                                                      from '@acx-ui/user'
import { getIntl }                                                                        from '@acx-ui/utils'

interface LagsTabProps {
  data: EdgeLagStatus[]
  isLoading?: boolean
}

interface LagsTableDataType extends EdgeLagStatus {
  key: string
}

export const LagsTab = (props: LagsTabProps) => {

  const { data, isLoading = false } = props
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
        return row.lagMembers?.length
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
      render: (_, { ipMode }) => {
        switch(ipMode) {
          case EdgeIpModeEnum.DHCP:
            return $t({ defaultMessage: 'DHCP' })
          case EdgeIpModeEnum.STATIC:
            return $t({ defaultMessage: 'Static IP' })
          default:
            return ''
        }
      }
    }
  ]

  const navigateToLagConfigPage = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/ports/lag`
    })
  }

  return (
    <GridRow justify='end'>
      {hasAccess() &&
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

const expandedRowRender = (memberStatus: EdgeLagMemberStatus[]) => {

  const { $t } = getIntl()

  const columns: TableProps<EdgeLagMemberStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'LACP State' }),
      key: 'lacpState',
      dataIndex: 'lacpState'
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
      dataIndex: 'lacpTimeout'
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
      key: 'lacpRxCount',
      dataIndex: 'lacpRxCount',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'LACP Tx Count' }),
      key: 'lacpTxCount',
      dataIndex: 'lacpTxCount',
      align: 'center'
    }
  ]
  return <Table columns={columns} dataSource={memberStatus} stickyHeaders={false} />
}

const convertToLagsTableDataType = (data: EdgeLagStatus[]):
LagsTableDataType[] => {
  return data.map(item => ({
    key: item.lagId,
    ...item
  }))
}
