import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                 from '@acx-ui/components'
import { useGetIotControllerListQuery }                              from '@acx-ui/rc/services'
import { defaultSort, IotControllerStatus, sortProp, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                from '@acx-ui/react-router-dom'

export function VenueIotController () {

  const payload = {
    filters: {}
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
          return (
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
          return row.publicAddress + ':' + row.publicPort
        }
      },
      {
        title: $t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' }),
        dataIndex: 'venueCount',
        key: 'venueCount'
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
