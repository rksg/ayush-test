import { useIntl } from 'react-intl'

import { Table, TableProps, SimpleListTooltip }                            from '@acx-ui/components'
import { EdgeServiceStatusLight }                                          from '@acx-ui/rc/components'
import { DhcpStats, getServiceDetailsLink, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink }                                                      from '@acx-ui/react-router-dom'

interface DhcpTableProps {
  data?: DhcpTableDataType[]
}

interface DhcpTableDataType extends DhcpStats {
  clusterIdNameList?: { id: string, name: string }[]
}

export const DhcpTable = (props: DhcpTableProps) => {
  const { data } = props
  const { $t } = useIntl()

  const columns: TableProps<DhcpTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'serviceName',
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.serviceName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      align: 'center',
      key: 'dhcpPoolNum',
      dataIndex: 'dhcpPoolNum',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Clusters' }),
      align: 'center',
      key: 'edgeClusterIds',
      dataIndex: 'edgeClusterIds',
      sorter: true,
      render: (_, row) =>{
        const clusterIdNameList = row.clusterIdNameList
        if (!clusterIdNameList?.length) return 0
        return <SimpleListTooltip
          items={clusterIdNameList.map(item => item.name)}
          displayText={clusterIdNameList.length}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      sorter: true,
      render: (data, row) =>
        (row?.edgeClusterIds?.length ?? 0) ?
          <EdgeServiceStatusLight data={row.edgeAlarmSummary} /> :
          '--'
    }
  ]

  return <Table
    rowKey='id'
    columns={columns}
    dataSource={data}
  />
}
