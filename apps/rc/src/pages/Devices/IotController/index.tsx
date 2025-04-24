import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, ColumnType, Loader, PageHeader, Table, TableProps }                                                                           from '@acx-ui/components'
import { useRwgActions }                                                                                                                       from '@acx-ui/rc/components'
import { useGetVenuesQuery, useGetIotControllerListQuery }                                                                                     from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, defaultSort, getRwgStatus, IotControllerStatus, seriesMappingRWG, sortProp, transformDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                                                                                                  from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess, useUserProfileContext }                                                                                    from '@acx-ui/user'
import { getOpsApi }                                                                                                                           from '@acx-ui/utils'



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
            to={`/ruckus-wan-gateway/${row.serialNumber}/gateway-details/overview`}>
            {highlightFn(row.name)}</TenantLink>
        )
      }
    },{
      title: $t({ defaultMessage: 'FQDN / IP (AP)' }),
      dataIndex: 'fqdn',
      key: 'fqdn',
      sorter: false
    },
    {
      title: $t({ defaultMessage: 'FQDN / IP (Public)' }),
      dataIndex: 'publicFqdn',
      key: 'publicFqdn'
    },
    {
      title: $t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' }),
      dataIndex: 'venueCount',
      key: 'venueCount'
    }
  ]

  return columns
}

export default function IotController () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { isCustomRole } = useUserProfileContext()

  const settingsId = 'iot-controller-table'
  const tableQuery = useTableQuery({
    useQuery: useGetIotControllerListQuery,
    pagination: { settingsId }
  })

  const columns = useColumns(true)

  const rowActions: TableProps<IotControllerStatus>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.updateGateway)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`devices/iotController/${selectedRows[0].serialNumber}/edit`, { replace: false })
    }
  },
  {
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Configure' }),
    // rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.updateGateway)],
    onClick: (selectedRows) => {
      window.open('https://' + (selectedRows[0]?.publicFqdn)?.toString() + '/admin',
        '_blank')
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.deleteGateway)],
    onClick: (rows, clearSelection) => {
      // TODO
    }
  }]

  const handleTableChange: TableProps<IotControllerStatus>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    tableQuery.setPayload({
      ...tableQuery.payload
    })
    // tableQuery.handleTableChange?.(pagination, filters, sorter, extra)
  }

  const count = tableQuery?.data?.totalCount || 0

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'IoT Controllers ({count})' }, { count })}
        extra={!isCustomRole && filterByAccess([
          <TenantLink to='/devices/iotController/add'
            rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.addGateway)]}>
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
          rowKey='rowId'
          rowActions={isCustomRole ? [] : filterByAccess(rowActions)}
          onChange={handleTableChange}
        />
      </Loader>
    </>
  )
}
