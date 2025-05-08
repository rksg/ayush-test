import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps }             from '@acx-ui/components'
import { useIotControllerActions }                                   from '@acx-ui/rc/components'
import { useGetIotControllerListQuery }                              from '@acx-ui/rc/services'
import { defaultSort, IotControllerStatus, sortProp, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate }                                   from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }                     from '@acx-ui/user'
// import { getOpsApi }                                              from '@acx-ui/utils'


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
            to={`/iots/${row.serialNumber}/details/overview`}>
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
      key: 'publicAddress'
    },
    {
      title: $t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' }),
      dataIndex: 'venueCount',
      key: 'venueCount'
    }
  ]

  return columns
}

export function IotController () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const iotControllerActions = useIotControllerActions()
  const { isCustomRole } = useUserProfileContext()

  const payload = {
    filters: {}
  }
  const settingsId = 'iot-controller-table'
  const tableQuery = useTableQuery({
    useQuery: useGetIotControllerListQuery,
    defaultPayload: payload,
    pagination: { settingsId },
    search: {
      searchTargetFields: ['name']
    }
  })

  const columns = useColumns(true)

  const rowActions: TableProps<IotControllerStatus>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.updateGateway)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].serialNumber}/edit`, { replace: false })
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

  const count = tableQuery?.data?.totalCount || 0

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'IoT Controllers ({count})' }, { count })}
        extra={!isCustomRole && filterByAccess([
          <TenantLink to='/devices/iotController/add'
            // rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.addGateway)]}
          >
            <Button type='primary'>{ $t({ defaultMessage: 'Add IoT Controller' }) }</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery
      ]}>
        <Table<IotControllerStatus>
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={{ total: tableQuery?.data?.totalCount }}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='iotContollerId'
          rowActions={isCustomRole ? [] : filterByAccess(rowActions)}
          onChange={handleTableChange}
        />
      </Loader>
    </>
  )
}
