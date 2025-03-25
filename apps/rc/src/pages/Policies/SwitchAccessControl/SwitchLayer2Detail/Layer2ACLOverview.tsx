import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useGetLayer2AclOverviewQuery, useVenuesListQuery }           from '@acx-ui/rc/services'
import {
  useTableQuery,
  MacAclOverview
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function Layer2ACLOverview () {
  const { $t } = useIntl()
  const settingsId = 'switch-access-control-overview'

  const defaultPayload = {
    fields: [ 'id', 'name', 'port' ],
    pagination: { settingsId }
  }

  const { venueFilterOptions } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data
        .map(v => ({ key: v.id, value: v.name }))
        .sort((a, b) => a.value.localeCompare(b.value)) || true
    })
  })

  const tableQuery = useTableQuery<MacAclOverview>({
    useQuery: useGetLayer2AclOverviewQuery,
    defaultPayload,
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<MacAclOverview>['columns'] = [
      {
        key: 'switchName',
        title: $t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchName',
        searchable: true,
        sorter: true,
        render: function (_, row, __, highlightFn) {
          return (
            <TenantLink
              to={`/devices/switch/${row.switchId}/${row.serialNumber}/details/overview`}
              style={{ lineHeight: '20px' }}
            >
              {highlightFn(row.switchName)}
            </TenantLink>
          )
        }
      },
      {
        key: 'model',
        title: $t({ defaultMessage: 'Model' }),
        dataIndex: 'model',
        filterable: true,
        sorter: true,
        render: function (_, row) {
          return row.model?.replace('_', '-')
        }
      },
      {
        key: 'ports',
        title: $t({ defaultMessage: 'Ports' }),
        dataIndex: 'ports',
        render: (_, row) => {
          return <Tooltip
            title={row.ports ? row.ports?.map((p: string) => p).join(', ') : ''}
            dottedUnderline={row.ports?.length ? true : false}
            placement='bottom'
          >
            {row.ports ? row.ports.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'venueName',
        title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        dataIndex: 'venueName',
        filterable: venueFilterOptions,
        filterKey: 'venueId',
        sorter: true,
        render: function (_, row) {
          return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}</TenantLink>
        }
      }
    ]
    return columns
  }

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <Card>
          <Card.Title style={{ marginTop: '16px', marginBottom: '16px' }}>
            {$t({ defaultMessage: 'Instances({count})' },
              { count: tableQuery.data?.data?.length })}</Card.Title>
          <Loader states={[tableQuery]}>
            <Table<MacAclOverview>
              settingsId={settingsId}
              columns={useColumns()}
              dataSource={tableQuery.data?.data}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
              rowKey='switchId'
              onFilterChange={tableQuery.handleFilterChange}
            />
          </Loader>
        </Card>
      </GridCol>
    </GridRow>
  )
}
