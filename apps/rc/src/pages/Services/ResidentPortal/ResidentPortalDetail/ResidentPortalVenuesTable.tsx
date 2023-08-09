import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetQueriablePropertyConfigsQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  PropertyConfigs
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export default function ResidentPortalVenuesTable () {
  const params = useParams()
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetQueriablePropertyConfigsQuery,
    defaultPayload: {
      filters: { residentPortalId: params.serviceId },
      fields: ['id', 'venueId', 'venueName']
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<PropertyConfigs>['columns'] = [
    {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venueName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      filterable: true,
      render: function (_, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    }
  ]

  return (
    <>
      <Typography.Title level={2}>
        {$t({ defaultMessage: 'Instances ({count})' }, { count: tableQuery.data?.totalCount })}
      </Typography.Title>
      <Loader states={[tableQuery]}>
        <Table<PropertyConfigs>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='venueId'
        />
      </Loader>
    </>
  )
}
