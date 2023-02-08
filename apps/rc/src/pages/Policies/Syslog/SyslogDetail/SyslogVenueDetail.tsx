import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }              from '@acx-ui/components'
import { useVenueRoguePolicyQuery }             from '@acx-ui/rc/services'
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
    'syslog',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25,
  filters: {
    'syslog.policyId': [] as string[]
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
      dataIndex: 'rogueAps',
      key: 'rogueAps',
      render: (data, row) => {
        return row.rogueAps ?? 0
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueRoguePolicyQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        'rogueDetection.policyId': [params.policyId]
      }
    }
  })

  const basicData = tableQuery.data?.data

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${basicData?.length ?? 0})`}>
      <div style={{ width: '100%' }}>
        <Table
          columns={basicColumns}
          dataSource={basicData}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default SyslogVenueDetail
