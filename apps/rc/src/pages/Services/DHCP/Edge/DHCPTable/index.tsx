
import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useDeleteEdgeDhcpServicesMutation,
  useGetDhcpStatsQuery,
  useGetEdgeListQuery,
  usePatchEdgeDhcpServiceMutation
}                                                 from '@acx-ui/rc/services'
import {
  DhcpStats,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }              from '@acx-ui/user'

import { EdgeDhcpServiceStatusLight } from '../EdgeDhcpStatusLight'

const EdgeDhcpTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const getDhcpStatsPayload = {
    fields: [
      'id',
      'serviceName',
      'dhcpPoolNum',
      'edgeNum',
      'venueNum',
      'health',
      'targetVersion',
      'currentVersion',
      'tags'
    ]
  }
  const tableQuery = useTableQuery({
    useQuery: useGetDhcpStatsQuery,
    defaultPayload: getDhcpStatsPayload,
    sorter: {
      sortField: 'serviceName',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['serviceName']
    }
  })
  const edgeOptionsDefaultPayload = {
    fields: ['name', 'serialNumber'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { edgeOptions = [] } = useGetEdgeListQuery(
    { payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          edgeOptions: data?.data.map(item => ({ value: item.name, key: item.serialNumber }))
        }
      }
    })
  const [deleteDhcp, { isLoading: isDeleteDhcpUpdating }] = useDeleteEdgeDhcpServicesMutation()
  const [patchDhcp, { isLoading: isPatchDhcpUpdating }] = usePatchEdgeDhcpServiceMutation()

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
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
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
      title: $t({ defaultMessage: 'SmartEdges' }),
      align: 'center',
      key: 'edgeNum',
      dataIndex: 'edgeNum',
      filterable: edgeOptions,
      filterKey: 'edgeIds',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      align: 'center',
      key: 'venueNum',
      dataIndex: 'venueNum',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      sorter: true,
      render (data, row) {
        return <EdgeDhcpServiceStatusLight data={row.health} />
      }
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      align: 'center',
      key: 'targetVersion',
      dataIndex: 'targetVersion',
      sorter: true,
      render (data, row) {
        if(isUpdateAvailable(row)) {
          return $t({ defaultMessage: 'Yes' })
        }
        return $t({ defaultMessage: 'No' })
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
            rows.length === 1 ?
              deleteDhcp({ params: { id: rows[0].id } })
                .then(clearSelection) :
              deleteDhcp({ payload: rows.map(item => item.id) })
                .then(clearSelection)
          }
        })
      }
    },
    {
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
          onOk: () => {
            patchDhcp({ params: { id: rows[0].id }, payload: { action: 'UPDATE_NOW' } })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'DHCP for SmartEdge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={
          isNavbarEnhanced ? [
            { text: $t({ defaultMessage: 'Network Control' }) },
            { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
          ] : [
            { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
          ]
        }
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteDhcpUpdating || isPatchDhcpUpdating }
      ]}>
        <Table
          settingsId='services-edge-dhcp-table'
          rowKey='id'
          columns={columns}
          rowSelection={hasAccess() && { type: 'radio' }}
          rowActions={filterByAccess(rowActions)}
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
