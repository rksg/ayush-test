import { useIntl } from 'react-intl'

import { Table, TableProps, Loader } from '@acx-ui/components'
import { useMeshApsQuery }           from '@acx-ui/rc/services'
import { useTableQuery, AP }         from '@acx-ui/rc/utils'
import { TenantLink }                from '@acx-ui/react-router-dom'

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<AP>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={'/networks/network-details/overview'}>{data}</TenantLink>
        )
      }
    },
    {
      key: 'venueName',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'venueName',
      sorter: true
    },
    {
      key: 'apUpRssi',
      title: intl.$t({ defaultMessage: 'Signal' }),
      dataIndex: 'apUpRssi',
      sorter: true
    },
    {
      key: 'apDownRssi',
      dataIndex: 'apDownRssi',
      sorter: true
    },
    {
      key: 'apMac',
      title: intl.$t({ defaultMessage: 'Mac address' }),
      dataIndex: 'apMac',
      sorter: true
    },
    {
      key: 'model',
      title: intl.$t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    },
    {
      key: 'IP',
      title: intl.$t({ defaultMessage: 'IP' }),
      dataIndex: 'IP',
      sorter: true,
      align: 'center'
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Connected clients' }),
      dataIndex: 'clients',
      sorter: true,
      align: 'center'
    },
    {
      key: 'hops',
      title: intl.$t({ defaultMessage: 'Hop Count' }),
      dataIndex: 'hops',
      sorter: true
    }
  ]
  return columns
}

const defaultPayload = {
  fields: [
    'clients',
    'serialNumber',
    'apDownRssis',
    'downlink',
    'IP',
    'apUpRssi',
    'apMac',
    'venueName',
    'meshRole',
    'uplink',
    'venueId',
    'name',
    'apUpMac',
    'apRssis',
    'model',
    'hops',
    'cog'
  ]
}

const expandedRowRender = (data: any) => {
  const rowData = data.downlink
  return (
    <Table
      columns={[
        {
          key: 'name',
          dataIndex: 'name',
          render: function (data, row) {
            return (
              <TenantLink to={'/networks/network-details/overview'}>{data}</TenantLink>
            )
          }
        },
        {
          key: 'venueName',
          dataIndex: 'venueName'
        },
        {
          key: 'apUpRssi',
          dataIndex: 'apUpRssi'
        },
        {
          key: 'apDownRssi',
          dataIndex: 'apDownRssi'
        },
        {
          key: 'apMac',
          dataIndex: 'apMac'
        },
        {
          key: 'model',
          dataIndex: 'model'
        },
        {
          key: 'IP',
          dataIndex: 'IP'
        },
        {
          key: 'clients',
          dataIndex: 'clients'
        },
        {
          key: 'hops',
          dataIndex: 'hops'
        }
      ]}
      rowKey='serialNumber'
      showHeader={false}
      showSorterTooltip={true}
      headerTitle={false}
      search={false}
      options={false}
      dataSource={rowData}
      pagination={false}
      expandable={rowData[0] && rowData[0].downlink.length > 0 ? { expandedRowRender }: undefined}
    />
  )
}

export function VenueMeshApsTable () {
  const { $t } = useIntl()
  const VenueMeshApsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMeshApsQuery,
      defaultPayload
    })
    
    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }
      ]}>
        <Table
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='serialNumber'
          expandable={{ expandedRowRender }}
        />
      </Loader>
    )
  }

  return (
    <VenueMeshApsTable />
  )
}