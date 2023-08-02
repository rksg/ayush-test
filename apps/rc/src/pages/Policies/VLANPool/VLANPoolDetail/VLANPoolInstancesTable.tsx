import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                from '@acx-ui/components'
import { useGetVLANPoolVenuesQuery }                      from '@acx-ui/rc/services'
import { VLANPoolVenues, VLANPoolAPGroup, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                     from '@acx-ui/react-router-dom'


export default function VLANPoolInstancesTable (){

  const { $t } = useIntl()
  // const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useGetVLANPoolVenuesQuery,
    defaultPayload: {
      fields: ['venueId', 'venueName', 'venueApCount', 'apGroupData'],
      pageSize: 10000
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'ASC'
    }
  })


  const columns: TableProps<VLANPoolVenues>['columns'] = [
    {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venueName',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) =>
        <TenantLink to={`venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>

    },
    {
      key: 'venueApCount',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'venueApCount',
      align: 'center',
      sorter: true
    },
    {
      key: 'apGroupData',
      title: $t({ defaultMessage: 'Deployment Scope' }),
      dataIndex: 'apGroupData',
      searchable: true,
      sorter: true,
      render: (__, { apGroupData }) => {
        const isAllAP = _.some(apGroupData, { apGroupName: 'ALL_APS' })
        return isAllAP ? $t({ defaultMessage: 'All APs' }) : apGroupData.length
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
          rowKey='venueId'
        />
      </Card>
    </Loader>
  )
}
