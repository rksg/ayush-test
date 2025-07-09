import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps } from '@acx-ui/components'
import { useWifiNetworkListQuery }         from '@acx-ui/rc/services'
import {
  IdentityProviderViewModel,
  Network,
  NetworkType,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { useTableQuery } from '@acx-ui/utils'



const defaultNetworkPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id',
    'securityProtocol'
  ],
  page: 1,
  pageSize: 1024
}


export function IdentityProviderInstancesTable (props: { data: IdentityProviderViewModel }) {
  const { $t } = useIntl()
  const { data } = props

  const networkIds = data?.wifiNetworkIds || []

  const tableQuery = useTableQuery<Network>({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: {
      ...defaultNetworkPayload,
      filters: { id: networkIds }
    },
    option: {
      skip: !networkIds?.length
    }
  })

  const columns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`networks/wireless/${row.id}/network-details/overview`}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      key: 'nwSubType',
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      render: (_, row) => {
        const venueCount = row.venues?.count
        return (
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/venues`}
            children={venueCount || 0}
          />
        )
      }
    }
  ]

  return (
    <Card title={$t({ defaultMessage: 'Instances ({count})' },
      { count: tableQuery.data?.totalCount ?? 0 }
    )}>
      <Loader states={[tableQuery]} >
        <Table
          columns={columns}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
        />
      </Loader>
    </Card>
  )
}
