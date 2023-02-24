import { CheckOutlined } from '@ant-design/icons'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Card, Table, TableProps }              from '@acx-ui/components'
import { useVenueSyslogPolicyQuery }            from '@acx-ui/rc/services'
import { useTableQuery, VenueSyslogPolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                           from '@acx-ui/react-router-dom'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'switches',
    'rogueAps',
    'rogueDetection',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25,
  filters: {
    'rogueDetection.policyId': [] as string[]
  }
}

const SyslogVenueDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basicColumns: TableProps<VenueSyslogPolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      render: (data, row) => {
        return <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{row.name}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'city',
      sorter: true,
      key: 'city'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi' }),
      dataIndex: 'syslogEnable',
      key: 'syslogEnable',
      render: (data, row) => {
        return row.rogueDetection?.enabled ? <CheckOutlined /> : null
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueSyslogPolicyQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        'rogueDetection.policyId': [params.policyId]
      }
    }
  })

  const basicData = tableQuery.data?.data

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instance ({count})' },
        { count: tableQuery.data?.totalCount }
      )
    }>
      <Table
        columns={basicColumns}
        dataSource={basicData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default SyslogVenueDetail
