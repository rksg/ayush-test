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
      fields: ['venueId', 'venueName', 'apGroupData'],
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
      sorter: true,
      render: (name, row) =>
        (<TenantLink to={`venues/${row.venueId}/venue-details/overview`}>{name}</TenantLink>)

    },
    {
      key: 'apGroupData',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'apGroupData',
      render: (groups) => _.sumBy(groups as VLANPoolAPGroup[], (o)=> o.apCount )
    },
    {
      key: 'DeploymentScope',
      title: $t({ defaultMessage: 'Deployment Scope' }),
      dataIndex: 'apGroupData',
      render: (groups) => {
        const isAllAP = _.some(groups as VLANPoolAPGroup[], { apGroupName: 'ALL_APS' })
        return isAllAP ? $t({ defaultMessage: 'All APs' }):(groups as VLANPoolAPGroup[]).length
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
        />
      </Card>
    </Loader>
  )
}
