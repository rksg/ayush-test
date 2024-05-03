import { Row }     from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Tooltip,
  showActionModal,
  Loader
} from '@acx-ui/components'
import { EdgeServiceStatusLight } from '@acx-ui/rc/components'
import {
  useVenuesListQuery,
  useDeleteEdgeSdLanMutation,
  useGetEdgeSdLanP2ViewDataListQuery,
  useGetEdgeClusterListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  EdgeSdLanViewDataP2,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink,
  useTableQuery,
  FILTER,
  SEARCH
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes }                    from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const clusterOptionsDefaultPayload = {
  fields: [
    'name',
    'clusterId'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

const EdgeSdLanTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  const settingsId = 'services-edge-sd-lan-p2-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeSdLanP2ViewDataListQuery,
    defaultPayload: {
      fields: [
        'id',
        'name',
        'venueId',
        'venueName',
        'tunnelProfileId',
        'tunnelProfileName',
        'guestTunnelProfileId',
        'guestTunnelProfileName',
        'edgeClusterId',
        'edgeClusterName',
        'guestEdgeClusterId',
        'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'networkIds',
        'networkInfos',
        'edgeAlarmSummary'
      ]
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    if (customFilters.guestEdgeClusterId?.length) {
      customFilters['isGuestTunnelEnabled'] = [true]
    } else {
      delete customFilters['guestEdgeClusterId']
      delete customFilters['isGuestTunnelEnabled']
    }
    tableQuery.handleFilterChange(customFilters,customSearch)
  }

  const [deleteSdLan, { isLoading: isDeleting }] = useDeleteEdgeSdLanMutation()

  const { venueOptions } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map((item) => ({
            value: item.name,
            key: item.id
          }))
        }
      }
    }
  )

  const { clusterOptions } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data.map(item => ({
            value: item.name!,
            key: item.clusterId!
          })),
          isLoading
        }
      }
    })

  const columns: TableProps<EdgeSdLanViewDataP2>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}
          >
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: true,
      filterable: venueOptions,
      render: (__, row) => {
        return <TenantLink
          to={`/venues/${row.venueId}/venue-details/overview`}
        >
          {row.venueName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      sorter: true,
      filterable: clusterOptions,
      render: (__, row) => {
        return <TenantLink
          to={`devices/edge/cluster/${row.edgeClusterId}/edit/cluster-details`}
        >
          {row.edgeClusterName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'DMZ Cluster' }),
      key: 'guestEdgeClusterId',
      dataIndex: 'guestEdgeClusterId',
      sorter: true,
      filterable: clusterOptions,
      render: (__, row) => {
        return (row.isGuestTunnelEnabled && row.guestEdgeClusterId)
          ? <TenantLink
            to={`devices/edge/cluster/${row.guestEdgeClusterId}/edit/cluster-details`}
          >
            {row.guestEdgeClusterName}
          </TenantLink>
          : ''
      }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networkIds',
      dataIndex: 'networkIds',
      align: 'center',
      sorter: true,
      render: (__, row) => {
        return (row.networkIds && row.networkIds.length)
          ? <Tooltip
            placement='bottom'
            title={
              row.networkIds.map(networkId => (
                <Row key={`edge-cf-tooltip-${networkId}`}>
                  { _.find(row.networkInfos, { networkId })?.networkName || '' }
                </Row>
              ))
            }
          >
            <span data-testid={`network-names-${row.id}`}>{row.networkIds.length}</span>
          </Tooltip>
          : row.networkIds?.length
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile(AP-Cluster)' }),
      key: 'tunnelProfileId',
      dataIndex: 'tunnelProfileId',
      sorter: true,
      render: (__, row) => {
        return <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.tunnelProfileId!
          })}
        >
          {row.tunnelProfileName}
        </TenantLink> }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile(Clusters)' }),
      key: 'guestTunnelProfileId',
      dataIndex: 'guestTunnelProfileId',
      sorter: true,
      render: (__, row) => {
        return (row.isGuestTunnelEnabled && row.guestTunnelProfileId)
          ? <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.DETAIL,
              policyId: row.guestTunnelProfileId
            })}
          >
            {row.guestTunnelProfileName}
          </TenantLink>
          : '' }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      width: 80,
      align: 'center',
      render: (__, row) =>
        <Row justify='center'>
          <EdgeServiceStatusLight
            data={row.edgeAlarmSummary ? [row.edgeAlarmSummary] : []}
          />
        </Row>
    }
    // {
    //   title: $t({ defaultMessage: 'Service Version' }),
    //   key: 'serviceVersion',
    //   dataIndex: 'serviceVersion',
    //   render: (__, row) => {
    //     return row.serviceVersion ?? noDataDisplay
    //   }
    // },
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // }
  ]

  const rowActions: TableProps<EdgeSdLanViewDataP2>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
            `${basePath.pathname}/` +
            getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.EDIT,
              serviceId: selectedRows[0].id!
            })
        })
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'SD-LAN' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteSdLan({ params: { serviceId: row.id } })))
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [EdgeScopes.UPDATE, EdgeScopes.DELETE]
  })

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'SD-LAN ({count})' },
          { count: tableQuery.data?.totalCount }
        )}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            scopeKey={[EdgeScopes.CREATE]}
            to={getServiceRoutePath({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.CREATE
            })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add SD-LAN Service' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader
        states={[
          tableQuery,
          { isLoading: false, isFetching: isDeleting }
        ]}
      >
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          rowSelection={isSelectionVisible && { type: 'checkbox' }}
          rowActions={filterByAccess(rowActions)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

export default EdgeSdLanTable
