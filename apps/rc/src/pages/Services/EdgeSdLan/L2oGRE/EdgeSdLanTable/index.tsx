import { useMemo } from 'react'

import { Row, Space }      from 'antd'
import { find, get, uniq } from 'lodash'
import { useIntl }         from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  showActionModal,
  Loader
} from '@acx-ui/components'
import { useIsSplitOn, Features }                                                                                             from '@acx-ui/feature-toggle'
import { CountAndNamesTooltip, EdgeTableCompatibilityWarningTooltip, EdgeServiceStatusLight, useEdgeSdLansCompatibilityData } from '@acx-ui/rc/components'
import {
  useVenuesListQuery,
  useDeleteEdgeSdLanMutation,
  useGetEdgeClusterListQuery,
  useGetEdgeMvSdLanViewDataListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink,
  useTableQuery,
  FILTER,
  SEARCH,
  EdgeMvSdLanViewData,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  defaultSort,
  getServiceAllowedOperation,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

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

export const EdgeSdLanTable = () => {
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  const settingsId = 'services-edge-mv-sd-lan-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeMvSdLanViewDataListQuery,
    defaultPayload: {
      fields: [
        'id',
        'name',
        'tunnelProfileId',
        'tunnelProfileName',
        'guestTunnelProfileId',
        'guestTunnelProfileName',
        'edgeClusterId',
        'edgeClusterName',
        'guestEdgeClusterId',
        'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunneledWlans',
        'tunneledGuestWlans',
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

  const currentServiceIds = useMemo(
    () => tableQuery.data?.data?.map(i => i.id!) ?? [],
    [tableQuery.data?.data])
  const skipFetchCompatibilities = !isEdgeCompatibilityEnabled || currentServiceIds.length === 0
  // eslint-disable-next-line max-len
  const sdLanCompatibilityData = useEdgeSdLansCompatibilityData(currentServiceIds, skipFetchCompatibilities)

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

  const columns: TableProps<EdgeMvSdLanViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'ServiceName' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        const serviceId = row.id

        return (<Space>
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}
          >
            {row.name}
          </TenantLink>
          {isEdgeCompatibilityEnabled && <EdgeTableCompatibilityWarningTooltip
            serviceId={serviceId!}
            featureName={IncompatibilityFeatures.SD_LAN}
            compatibility={sdLanCompatibilityData.compatibilities}
          />}
        </Space>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      width: 80,
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          <EdgeServiceStatusLight
            data={row.edgeAlarmSummary ? [row.edgeAlarmSummary] : []}
          />
        </Row>
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' }),
      key: 'tunnelProfileId',
      dataIndex: 'tunnelProfileId',
      sorter: true,
      render: (_, row) => {
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
      title: $t({ defaultMessage: 'Destination RUCKUS Edge cluster' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      sorter: true,
      filterable: clusterOptions,
      render: (_, row) => {
        return <TenantLink
          to={`devices/edge/cluster/${row.edgeClusterId}/edit/cluster-details`}
        >
          {row.edgeClusterName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      key: 'tunneledWlans.venueId',
      dataIndex: 'tunneledWlans.venueId',
      align: 'center',
      sorter: true,
      filterable: venueOptions,
      render: (_, row) => {
        const venueIds = uniq(row.tunneledWlans?.map(wlan => wlan.venueId))
        const venuesCount = venueIds.length
        const venueNames = venueIds.map(id => {
          const name = find(venueOptions, { key: id })?.value
          return name
        }).filter(i => i)

        return venuesCount > 0
          ? <CountAndNamesTooltip data={{
            count: venuesCount, names: venueNames.sort(defaultSort) as string[]
          }}
          />
          : venuesCount
      }
    }
  ]

  const rowActions: TableProps<EdgeMvSdLanViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT),
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
      scopeKey: getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.DELETE),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.EDGE_SD_LAN, ServiceOperation.DELETE),
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

  const handleTableChange: TableProps<EdgeMvSdLanViewData>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    const originSortField = get(sorter, 'field')
    tableQuery.handleTableChange?.(pagination, filters, {
      ...sorter,
      field: originSortField === 'tunneledWlans.venueId' ? 'venueCount' : originSortField
    }, extra)
  }

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

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
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.CREATE)}
            // eslint-disable-next-line max-len
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_SD_LAN, ServiceOperation.CREATE)}
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
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
          rowActions={allowedRowActions}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={handleTableChange}
          onFilterChange={handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}
