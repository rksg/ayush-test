import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  useIotControllerActions
} from '@acx-ui/rc/components'
import { useGetIotControllerListQuery } from '@acx-ui/rc/services'
import {
  getIotControllerStatus,
  transformDisplayText,
  IotControllerStatus,
  IotControllerStatusEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }             from '@acx-ui/user'
import { useTableQuery }                                     from '@acx-ui/utils'

export function VenueIotController () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const iotControllerActions = useIotControllerActions()
  const { isCustomRole } = useUserProfileContext()

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
        sorter: true,
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
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'status',
        key: 'status',
        sorter: false,
        render: function (_, row) {
          const { name, color } = getIotControllerStatus(row.status)

          return (
            <Badge
              color={`var(${color})`}
              text={transformDisplayText(name)}
            />
          )
        }
      },{
        title: $t({ defaultMessage: 'FQDN / IP (AP)' }),
        dataIndex: 'inboundAddress',
        sorter: true,
        key: 'inboundAddress'
      },
      {
        title: $t({ defaultMessage: 'FQDN / IP (Public)' }),
        dataIndex: 'publicAddress',
        sorter: true,
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

  const basePath = useTenantLink('/devices/iotController/')

  const rowActions: TableProps<IotControllerStatus>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.updateGateway)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({ ...basePath,
        pathname: `${basePath.pathname}/${selectedRows[0].id}/edit`
      },
      { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.deleteGateway)],
    onClick: (rows, clearSelection) => {
      iotControllerActions.deleteIotController(rows, undefined, clearSelection)
    }
  }]

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
        rowActions={isCustomRole ? [] : filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        onChange={handleTableChange}
      />
    </Loader>
  )
}
