import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  StackedBarChart,
  cssStr,
  deviceStatusColors,
  getDeviceConnectionStatusColors
} from '@acx-ui/components'
import { useVenuesListQuery }                       from '@acx-ui/rc/services'
import { useTableQuery, ApDeviceStatusEnum, Venue } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate }                  from '@acx-ui/react-router-dom'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Data IP' }),
      key: 'dataIp',
      dataIndex: 'dataIp',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Mgmt. IP' }),
      key: 'mgmtIp',
      dataIndex: 'mgmtIp',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'mac',
      dataIndex: 'mac',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Ports' }),
      key: 'ports',
      dataIndex: 'ports',
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/clients`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: 'venue',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      key: 'clients',
      dataIndex: 'clients',
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      key: 'tags',
      dataIndex: 'tags',
      title: $t({ defaultMessage: 'Tags' })
    }
  ]

  return columns
}

const defaultPayload = {
  fields: [
    'check-all',
    'name',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'switches',
    'switchClients',
    'clients',
    'cog',
    'latitude',
    'longitude',
    'status',
    'id'
  ],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export function EdgesTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const EdgesTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVenuesListQuery,
      defaultPayload
    })

    const rowActions: TableProps<Venue>['rowActions'] = [{
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit/details`, { replace: false })
      }
    }]

    return (
      <Loader states={[
        tableQuery
      ]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={[
          <TenantLink to='/devices/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add ' }) }</Button>
          </TenantLink>
        ]}
      />
      <EdgesTable />
    </>
  )
}



