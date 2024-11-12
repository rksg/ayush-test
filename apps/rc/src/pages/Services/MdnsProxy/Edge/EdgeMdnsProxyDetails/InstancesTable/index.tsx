import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps }                                         from '@acx-ui/components'
import { formatter }                                                               from '@acx-ui/formatter'
import { useGetEdgeMdnsProxyStatsListQuery, useGetEdgeMdnsProxyViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeMdnsProxyActivation, EdgeMdnsProxyStatsData, transformDisplayNumber } from '@acx-ui/rc/utils'
import { TenantLink }                                                              from '@acx-ui/react-router-dom'

interface InstancesTableProps {
  serviceId: string | undefined
}

export const InstancesTable = (props: InstancesTableProps) => {
  const { $t } = useIntl()
  const { serviceId } = props

  const {
    currentMdnsStatusData,
    isMdnsStatusDataLoading
  } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'activations'],
      filters: { id: [serviceId] }
    }
  }, {
    skip: !serviceId,
    selectFromResult: ({ data, isLoading }) => ({
      currentMdnsStatusData: data?.data[0],
      isMdnsStatusDataLoading: isLoading
    })
  })
  const { mdnsStatsMap, isMdnsStatsDataLoading } = useGetEdgeMdnsProxyStatsListQuery({
    payload: {
      fields: [
        'clusterId', 'rxPackets', 'txPackets', 'rxBytes', 'txBytes', 'rxRequest', 'rxResponse',
        'numTypesMdnsServices'
      ],
      filters: {
        profileId: [serviceId],
        clusterId: currentMdnsStatusData?.activations?.map(item => item.edgeClusterId)
      }
    }
  }, {
    skip: !serviceId || !currentMdnsStatusData?.activations?.length,
    selectFromResult: ({ data, isLoading }) => ({
      mdnsStatsMap: calculateStatsData(data?.data),
      isMdnsStatsDataLoading: isLoading
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
      key: 'rx',
      align: 'center',
      render: (_, row) => (`
        ${mdnsStatsMap?.[row.edgeClusterId]?.rxPackets ?? 0}
        |
        ${formatter('bytesFormat')(mdnsStatsMap?.[row.edgeClusterId]?.rxBytes ?? 0)}
      `)
    },
    {
      title: $t({ defaultMessage: 'Tx Packets/bytes' }),
      dataIndex: 'tx',
      key: 'tx',
      align: 'center',
      render: (_, row) => (`
        ${mdnsStatsMap?.[row.edgeClusterId]?.txPackets ?? 0}
        |
        ${formatter('bytesFormat')(mdnsStatsMap?.[row.edgeClusterId]?.txBytes ?? 0)}
      `)
    },
    {
      title: $t({ defaultMessage: 'Client Queries' }),
      dataIndex: 'clientQueries',
      key: 'clientQueries',
      render: (_, row) => (mdnsStatsMap?.[row.edgeClusterId]?.rxRequest ?? 0)
    },
    {
      title: $t({ defaultMessage: 'Server Responses' }),
      dataIndex: 'serverResponses',
      key: 'serverResponses',
      render: (_, row) => (mdnsStatsMap?.[row.edgeClusterId]?.rxResponse ?? 0)
    },
    {
      title: $t({ defaultMessage: 'Types of mDNS Services' }),
      dataIndex: 'types',
      key: 'types',
      render: (_, row) => (mdnsStatsMap?.[row.edgeClusterId]?.numTypesMdnsServices ?? 0)
    }
  ]

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instances ({count})' },
        { count: transformDisplayNumber(currentMdnsStatusData?.activations?.length) }
      )
    }>
      <Loader states={[{ isLoading: isMdnsStatusDataLoading || isMdnsStatsDataLoading }]}>
        <Table
          columns={columns}
          dataSource={currentMdnsStatusData?.activations ?? []}
          rowKey='edgeClusterId'
        />
      </Loader>
    </Card>
  )
}

const calculateStatsData = (data?: EdgeMdnsProxyStatsData[]) => {
  return data?.reduce((acc, cur) => {
    const currentClusterId = cur.clusterId ?? ''
    acc[currentClusterId] = acc[currentClusterId] || {
      rxPackets: 0,
      txPackets: 0,
      rxBytes: 0,
      txBytes: 0,
      rxRequest: 0,
      rxResponse: 0,
      numTypesMdnsServices: 0
    }
    acc[currentClusterId].rxPackets += cur.rxPackets ?? 0
    acc[currentClusterId].txPackets += cur.txPackets ?? 0
    acc[currentClusterId].rxBytes += cur.rxBytes ?? 0
    acc[currentClusterId].txBytes += cur.txBytes ?? 0
    acc[currentClusterId].rxRequest += cur.rxRequest ?? 0
    acc[currentClusterId].rxResponse += cur.rxResponse ?? 0
    acc[currentClusterId].numTypesMdnsServices += cur.numTypesMdnsServices ?? 0
    return acc
  }, {} as { [clusterId: string]: {
    rxPackets: number,
    txPackets: number,
    rxBytes: number,
    txBytes: number,
    rxRequest: number,
    rxResponse: number,
    numTypesMdnsServices: number
  } })
}