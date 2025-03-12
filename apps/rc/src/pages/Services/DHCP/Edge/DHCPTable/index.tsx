
import { useMemo } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps }                                                                    from '@acx-ui/components'
import { EdgeServiceStatusLight, EdgeTableCompatibilityWarningTooltip, SimpleListTooltip, useEdgeDhcpActions, useEdgeDhcpCompatibilityData } from '@acx-ui/rc/components'
import {
  useDeleteEdgeDhcpServicesMutation,
  useGetDhcpStatsQuery,
  useGetEdgeClusterListQuery
} from '@acx-ui/rc/services'
import {
  DhcpStats,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  IncompatibilityFeatures,
  ServiceOperation,
  ServiceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'


const EdgeDhcpTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const getDhcpStatsPayload = {
    fields: [
      'id',
      'serviceName',
      'dhcpPoolNum',
      'edgeClusterIds',
      'health',
      'targetVersion',
      'currentVersion',
      'tags',
      'edgeAlarmSummary'
    ]
  }
  const settingsId = 'services-edge-dhcp-table'
  const tableQuery = useTableQuery({
    useQuery: useGetDhcpStatsQuery,
    defaultPayload: getDhcpStatsPayload,
    sorter: {
      sortField: 'serviceName',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['serviceName']
    },
    pagination: { settingsId }
  })
  const edgeClusterOptionsDefaultPayload = {
    fields: ['name', 'clusterId'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { edgeClusterOptions = [] } = useGetEdgeClusterListQuery(
    { payload: edgeClusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        const mappedData = data?.data?.map(item => ({ key: item.clusterId, value: item.name }))

        return { edgeClusterOptions: mappedData }
      }
    }
  )
  const [deleteDhcp, { isLoading: isDeleteDhcpUpdating }] = useDeleteEdgeDhcpServicesMutation()
  const { upgradeEdgeDhcp, isEdgeDhcpUpgrading } = useEdgeDhcpActions()
  const currentServiceIds = useMemo(
    () => tableQuery.data?.data?.map(i => i.id!) ?? [],
    [tableQuery.data?.data])
  const skipFetchCompatibilities = currentServiceIds.length === 0

  // eslint-disable-next-line max-len
  const dhcpCompatibilityData = useEdgeDhcpCompatibilityData(currentServiceIds, skipFetchCompatibilities)

  const isUpdateAvailable = (data: DhcpStats) => {
    let isReadyToUpdate = false
    if (data?.currentVersion && data?.targetVersion) {
      data?.currentVersion.split(',').forEach(currentVersion=>{
        if (currentVersion.trim() !== data?.targetVersion) {
          isReadyToUpdate = true
        }
      })
    }

    return isReadyToUpdate
  }

  const columns: TableProps<DhcpStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'serviceName',
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      searchable: true,
      render: function (_, row) {
        return (
          <Space>
            <TenantLink
              to={getServiceDetailsLink({
                type: ServiceType.EDGE_DHCP,
                oper: ServiceOperation.DETAIL,
                serviceId: row.id!
              })}>
              {row.serviceName}
            </TenantLink>
            <EdgeTableCompatibilityWarningTooltip
              serviceId={row.id!}
              featureName={IncompatibilityFeatures.DHCP}
              compatibility={dhcpCompatibilityData.compatibilities}
            />
          </Space>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      align: 'center',
      key: 'dhcpPoolNum',
      dataIndex: 'dhcpPoolNum',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Clusters' }),
      align: 'center',
      key: 'edgeClusterIds',
      dataIndex: 'edgeClusterIds',
      filterable: edgeClusterOptions,
      filterKey: 'edgeClusterIds',
      sorter: true,
      render: (_, row) =>{
        if (!row.edgeClusterIds?.length) return 0
        const edgeClusterIds = row.edgeClusterIds
        const tooltipItems = edgeClusterOptions
          .filter(v => v.key && edgeClusterIds!.includes(v.key))
          .map(v => v.value)
          .filter((item): item is string => item !== undefined)
        return <SimpleListTooltip items={tooltipItems} displayText={edgeClusterIds.length} />
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      sorter: true,
      render: (data, row) =>
        (row?.edgeClusterIds?.length ?? 0) ?
          <EdgeServiceStatusLight data={row.edgeAlarmSummary} /> :
          '--'
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      align: 'center',
      key: 'targetVersion',
      dataIndex: 'targetVersion',
      sorter: true,
      render (data, row) {
        return isUpdateAvailable(row) ?
          $t({ defaultMessage: 'Yes' }) :
          $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      align: 'center',
      key: 'currentVersion',
      dataIndex: 'currentVersion',
      sorter: true,
      render (data, row) {
        return row.currentVersion || $t({ defaultMessage: 'NA' })
      }
    }
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render (data, row) {
    //     return row.tags?.join(',')
    //   }
    // }
  ]

  const rowActions: TableProps<DhcpStats>['rowActions'] = [
    {
      scopeKey: getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_DHCP, ServiceOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getServiceDetailsLink({
            type: ServiceType.EDGE_DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: selectedRows[0].id!
          })}`
        })
      }
    },
    {
      scopeKey: getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_DHCP, ServiceOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'DHCP' }),
            entityValue: rows.length === 1 ? rows[0].serviceName : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteDhcp({ params: { id: rows[0].id } })
              .then(clearSelection)
          }
        })
      }
    },
    {
      scopeKey: getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.EDIT),
      visible: (selectedRows) => isUpdateAvailable(selectedRows[0]),
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Service Update' }),
          content: rows.length === 1 ?
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Are you sure you want to update this service to the latest version immediately?' }) :
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Are you sure you want to update these services to the latest version immediately?' }),
          okText: $t({ defaultMessage: 'Update' }),
          onOk: async () => {
            await upgradeEdgeDhcp(rows[0].id)
            clearSelection()
          }
        })
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'DHCP for RUCKUS Edge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE })}
            scopeKey={getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.CREATE)}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_DHCP, ServiceOperation.CREATE)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteDhcpUpdating || isEdgeDhcpUpgrading }
      ]}>
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          rowActions={allowedRowActions}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

export default EdgeDhcpTable
