import { FormattedMessage, useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                                                                           from '@acx-ui/components'
import { useAaaNetworkInstancesQuery }                                                                               from '@acx-ui/rc/services'
import { AAAPolicyNetwork, captiveNetworkTypes, GuestNetworkTypeEnum, NetworkTypeEnum, networkTypes, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                from '@acx-ui/react-router-dom'

export default function AAAInstancesTable (){

  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useAaaNetworkInstancesQuery,
    defaultPayload: {
      fields: ['networkName', 'networkId', 'guestNetworkType', 'networkType'],
      filters: {}
    },
    sorter: {
      sortField: 'networkName',
      sortOrder: 'DESC'
    },
    search: {
      searchTargetFields: ['networkName'],
      searchString: ''
    }
  })
  const columns: TableProps<AAAPolicyNetwork>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'networkName',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/networks/wireless/${row.networkId}/network-details/aps`}>
            {row.networkName}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'networkType',
      sorter: true,
      render: (_, row) => {
        const message = networkTypes[row.networkType.toLowerCase() as NetworkTypeEnum]
        return row.networkType === 'GUEST'
          ? <FormattedMessage
            defaultMessage={'Captive Portal - {captiveNetworkType}'}
            values={{
              captiveNetworkType: $t(captiveNetworkTypes[
                row.guestNetworkType as GuestNetworkTypeEnum || GuestNetworkTypeEnum.Cloudpath
              ])
            }}
          />
          : <FormattedMessage {...message}/>
      }
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Card>
    </Loader>
  )
}
