import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }    from '@acx-ui/components'
import { useGetIotControllerListQuery } from '@acx-ui/rc/services'
import {
  defaultSort,
  IotControllerStatus,
  IotControllerStatusEnum,
  sortProp,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

export function VenueIotController () {
  const params = useParams()

  const payload = {
    fields: [
      'id',
      'name',
      'inboundAddress',
      'publicAddress',
      'publicPort',
      'tenantId',
      'status',
      'assocVenueCount'
    ],
    pageSize: 10,
    sortField: 'name',
    sortOrder: 'ASC',
    filters: { tenantId: [params.tenantId], venueId: [params.venueId] }
  }
  const settingsId = 'venue-iot-controller-table'
  const tableQuery = useTableQuery({
    useQuery: useGetIotControllerListQuery,
    defaultPayload: payload,
    pagination: { settingsId },
    search: {
      searchTargetFields: ['name']
    }
  })

  function useColumns (
    searchable?: boolean
  ) {
    const { $t } = useIntl()

    const columns: TableProps<IotControllerStatus>['columns'] = [
      {
        title: $t({ defaultMessage: 'IoT Controller' }),
        key: 'name',
        dataIndex: 'name',
        sorter: { compare: sortProp('name', defaultSort) },
        fixed: 'left',
        searchable: searchable,
        defaultSortOrder: 'ascend',
        render: function (_, row, __, highlightFn) {
          return row.status !== IotControllerStatusEnum.ONLINE ? row.name : (
            <TenantLink
              to={`/devices/iotController/${row.id}/details/overview`}>
              {highlightFn(row.name)}</TenantLink>
          )
        }
      },{
        title: $t({ defaultMessage: 'FQDN / IP (AP)' }),
        dataIndex: 'inboundAddress',
        key: 'inboundAddress'
      },
      {
        title: $t({ defaultMessage: 'FQDN / IP (Public)' }),
        dataIndex: 'publicAddress',
        key: 'publicAddress',
        render: function (_, row) {
          if (!row.publicAddress || !row.publicPort) {
            return '--'
          }
          return row.publicAddress + ':' + row.publicPort
        }
      }
    ]

    return columns
  }

  const columns = useColumns(true)

  const handleTableChange: TableProps<IotControllerStatus>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    tableQuery.setPayload({
      ...tableQuery.payload
    })
    tableQuery.handleTableChange?.(pagination, filters, sorter, extra)
  }

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table<IotControllerStatus>
        settingsId={settingsId}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={{ total: tableQuery?.data?.totalCount }}
        onFilterChange={tableQuery.handleFilterChange}
        rowKey={(row: IotControllerStatus) => (row.id ?? `c-${row.id}`)}
        onChange={handleTableChange}
      />
    </Loader>
  )
}
