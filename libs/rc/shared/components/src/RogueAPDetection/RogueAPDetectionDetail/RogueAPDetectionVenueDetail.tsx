import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }                                    from '@acx-ui/components'
import { useVenueRoguePolicyQuery }                                   from '@acx-ui/rc/services'
import { defaultSort, sortProp, useTableQuery, VenueRoguePolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                 from '@acx-ui/react-router-dom'

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
  search: {
    searchTargetFields: ['name']
  },
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25,
  filters: {
    'rogueDetection.policyId': [] as string[]
  }
}

const RogueAPDetectionVenueDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basicColumns: TableProps<VenueRoguePolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row, __, highlightFn) => {
        return <TenantLink to={`/venues/${row.id}/venue-details/overview`}>
          {highlightFn(row.name)}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'city',
      sorter: { compare: sortProp('country', defaultSort) },
      key: 'city',
      render: (_, row) => {
        let trimCity = row.city?.trim()
        if (trimCity && trimCity[0] === ',') {
          trimCity.replace(',', '')
        }
        return [row.country, trimCity].join(',')
      }
    },
    {
      title: $t({ defaultMessage: 'Rogue APs' }),
      dataIndex: 'rogueAps',
      key: 'rogueAps',
      sorter: true,
      render: (_, row) => {
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
    },
    search: {
      searchTargetFields: ['name']
    }
  })

  const basicData = tableQuery.data?.data

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${basicData?.length ?? 0})`}>
      <div style={{ width: '100%' }}>
        <Table
          enableApiFilter={true}
          columns={basicColumns}
          dataSource={basicData}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default RogueAPDetectionVenueDetail
