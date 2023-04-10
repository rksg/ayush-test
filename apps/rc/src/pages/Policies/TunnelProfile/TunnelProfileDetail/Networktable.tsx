import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps }             from '@acx-ui/components'
import { useNetworkListQuery }                   from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { TenantLink }                            from '@acx-ui/react-router-dom'

interface NetworkTableProps {
  networkIds: string[]
}

export const NetworkTable = (props: NetworkTableProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const defaultNetworkPayload = {
    fields: [
      'id',
      'name',
      'nwSubType',
      'venues'
    ],
    filters: { id: props.networkIds }
  }
  const{ data, isLoading } = useNetworkListQuery(
    { params, payload: defaultNetworkPayload },
    { skip: props.networkIds.length === 0 }
  )

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'nwSubType',
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => (
        <NetworkType
          networkType={data as NetworkTypeEnum}
          row={row}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      key: 'venues',
      dataIndex: 'venues',
      sorter: true,
      render: (data, row) => row.venues.count
    }
  ]

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isLoading
    }]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data?.data}
      />
    </Loader>
  )
}