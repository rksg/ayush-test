import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { useGetVLANPoolVenuesQuery, useGetVlanPoolTemplateVenuesQuery } from '@acx-ui/rc/services'
import { VLANPoolVenues, useConfigTemplate }                            from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                        from '@acx-ui/react-router-dom'
import { useTableQuery }                                                from '@acx-ui/utils'


export default function VLANPoolInstancesTable (){
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isPolicyRbacEnabled
  const params = useParams()
  const defaultPayload = resolvedRbacEnabled ? {
    fields: ['id', 'wifiNetworkIds' ,'wifiNetworkVenueApGroups'],
    filters: { id: [params.policyId!!] },
    pageSize: 1
  } : {
    fields: ['venueId', 'venueName', 'venueApCount', 'apGroupData'],
    pageSize: 10000
  }

  const sorter = resolvedRbacEnabled ? { sortField: 'name', sortOrder: 'ASC' } : {
    sortField: 'venueName',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVlanPoolTemplateVenuesQuery : useGetVLANPoolVenuesQuery,
    defaultPayload: defaultPayload,
    sorter: sorter,
    enableRbac: resolvedRbacEnabled
  })


  const columns: TableProps<VLANPoolVenues>['columns'] = [
    {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Name' }),
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
      sorter: !resolvedRbacEnabled
    },
    {
      key: 'apGroupData',
      title: $t({ defaultMessage: 'Deployment Scope' }),
      dataIndex: 'apGroupData',
      searchable: true,
      sorter: !resolvedRbacEnabled,
      render: (__, { apGroupData }) => {
        const isAllAP = _.some(apGroupData, { apGroupName: 'ALL_APS' })
        return isAllAP ? $t({ defaultMessage: 'All APs' }) : apGroupData?.length
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
