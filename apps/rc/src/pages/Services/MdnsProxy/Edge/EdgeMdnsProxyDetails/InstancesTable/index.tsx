import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps }                 from '@acx-ui/components'
import { useGetEdgeMdnsProxyViewDataListQuery }            from '@acx-ui/rc/services'
import { EdgeMdnsProxyActivation, transformDisplayNumber } from '@acx-ui/rc/utils'
import { TenantLink }                                      from '@acx-ui/react-router-dom'

interface InstancesTableProps {
  serviceId: string | undefined
}

export const InstancesTable = (props: InstancesTableProps) => {
  const { $t } = useIntl()
  const { serviceId } = props

  const {
    data,
    isLoading
  } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'activations'],
      filters: { id: [serviceId] }
    }
  }, {
    skip: !serviceId,
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data[0],
      isLoading
    })
  })

  const columns: TableProps<EdgeMdnsProxyActivation>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`devices/edge/cluster/${row.edgeClusterId}/edit/cluster-details`}>
          {row.edgeClusterName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      key: 'venueName',
      sorter: true,
      render: (_, row) => {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Rx Packets/bytes' }),
      dataIndex: 'rx',
      key: 'rx'
    },
    {
      title: $t({ defaultMessage: 'Tx Packets/bytes' }),
      dataIndex: 'tx',
      key: 'tx'
    },
    {
      title: $t({ defaultMessage: 'Client Queries' }),
      dataIndex: 'clientQueries',
      key: 'clientQueries'
    },
    {
      title: $t({ defaultMessage: 'Server Responses' }),
      dataIndex: 'serverResponses',
      key: 'serverResponses'
    },
    {
      title: $t({ defaultMessage: 'Types of mDNS Services' }),
      dataIndex: 'types',
      key: 'types'
    }
  ]

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instances ({count})' },
        { count: transformDisplayNumber(data?.activations?.length) }
      )
    }>
      <Loader states={[{ isLoading }]}>
        <Table
          columns={columns}
          dataSource={data?.activations ?? []}
          rowKey='edgeClusterId'
        />
      </Loader>
    </Card>
  )
}