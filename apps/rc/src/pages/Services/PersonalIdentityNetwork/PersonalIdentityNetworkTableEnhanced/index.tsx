import { useMemo } from 'react'

import { Row, Space } from 'antd'
import { find }       from 'lodash'
import { useIntl }    from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                           from '@acx-ui/feature-toggle'
import { EdgeServiceStatusLight, CountAndNamesTooltip, useEdgePinsCompatibilityData, EdgeTableCompatibilityWarningTooltip } from '@acx-ui/rc/components'
import {
  useDeleteEdgePinMutation,
  useGetEdgeClusterListQuery,
  useGetEdgePinViewDataListQuery,
  useNetworkListQuery,
  useSwitchListQuery,
  useVenuesListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  IncompatibilityFeatures,
  PersonalIdentityNetworksViewData,
  ServiceOperation,
  ServiceType,
  useTableQuery,
  VenueLink
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { noDataDisplay }                                       from '@acx-ui/utils'

const getEdgePinPayload = {
  fields: [
    'id',
    'name',
    'tags',
    'venueId',
    'edgeClusterInfo',
    'tunneledWlans',
    'distributionSwitchInfos',
    'accessSwitchInfos',
    'edgeAlarmSummary'
  ]
}
const clusterOptionsDefaultPayload = {
  fields: ['name', 'clusterId', 'venueId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const networkDefaultPayload = {
  fields: ['name', 'id'],
  filters: { nwSubType: ['dpsk'] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const switchDefaultPayload = {
  fields: ['name', 'switchMac'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const PersonalIdentityNetworkTableEnhanced = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('')
  const settingsId = 'services-pin-table'

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [ deleteEdgePin, { isLoading: isPinDeleting } ] = useDeleteEdgePinMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetEdgePinViewDataListQuery,
    defaultPayload: getEdgePinPayload,
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
  const skipFetchCompatibilities = currentServiceIds.length === 0
  // eslint-disable-next-line max-len
  const compatibilityData = useEdgePinsCompatibilityData(currentServiceIds, skipFetchCompatibilities)

  const { clusterOptions } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          clusterOptions: data?.data.map(item => ({ value: item.name, key: item.clusterId })) ?? []
        }
      }
    })

  const { venueOptions } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => ({
        venueOptions: data?.data.map(v=>({ key: v.id, value: v.name })) ?? []
      })
    })

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  const { networkOptions = [] } = getNetworkListQuery(
    { payload: networkDefaultPayload },
    {
      selectFromResult: ({ data }) => ({
        networkOptions: data?.data.map(item => ({ key: item.id, value: item.name }))
      })
    })

  const { switchOptions } = useSwitchListQuery(
    { payload: switchDefaultPayload,
      enableRbac: isSwitchRbacEnabled
    }, {
      selectFromResult: ({ data }) => ({
        switchOptions: data?.data.map(item => ({ key: item.switchMac, value: item.name })) ?? []
      })
    })

  const columns: TableProps<PersonalIdentityNetworksViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        const serviceId = row.id

        return <Space>
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PIN,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
          <EdgeTableCompatibilityWarningTooltip
            serviceId={serviceId!}
            featureName={IncompatibilityFeatures.PIN}
            compatibility={compatibilityData.compatibilities}
          />
        </Space>
      }
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: true,
      filterable: venueOptions,
      filterKey: 'venueId',
      render: (_, { venueId }) => {
        const venueInfo = find(venueOptions, { key: venueId })
        return <VenueLink venueId={venueInfo?.key} name={venueInfo?.value} />
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edge',
      dataIndex: 'edgeClusterInfo',
      sorter: true,
      filterable: clusterOptions,
      filterKey: 'edgeClusterInfo.edgeClusterId',
      render: (_, row) => {
        const clusterInfo = row.edgeClusterInfo
        return (
          // eslint-disable-next-line max-len
          <TenantLink to={`/devices/edge/cluster/${clusterInfo?.edgeClusterId}/edit/cluster-details`}>
            {clusterInfo?.edgeClusterName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Dist. Switches' }),
      key: 'distributionSwitchInfos',
      dataIndex: 'distributionSwitchInfos',
      align: 'center',
      filterable: switchOptions,
      filterKey: 'distributionSwitchInfos.id',
      filterPlaceholder: $t({ defaultMessage: 'Switches' }),
      render: (_, row) => {
        const switchIds = row.distributionSwitchInfos?.map(s => s.id) ?? []

        return <CountAndNamesTooltip data={{
          count: switchIds.length,
          names: switchIds
            .map(switchId => find(switchOptions, { key: switchId })?.value)
            .filter(n => n) as string[]
        }}/>
      }
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      key: 'accessSwitchInfos',
      dataIndex: 'accessSwitchInfos',
      align: 'center',
      render: (_, row) => {
        const switchIds = row.accessSwitchInfos?.map(s => s.id) ?? []

        return <CountAndNamesTooltip data={{
          count: switchIds.length,
          names: switchIds
            .map(switchId => find(switchOptions, { key: switchId })?.value)
            .filter(n => n) as string[]
        }}/>
      }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networks',
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkOptions,
      filterKey: 'tunneledWlans.networkId',
      render: (_, row) => {
        return <CountAndNamesTooltip data={{
          count: row.tunneledWlans?.length ?? 0,
          names: row.tunneledWlans
            ?.map(wlan => find(networkOptions, { key: wlan.networkId })?.value)
            .filter(n => n) as string[]
        }}/>
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      align: 'center',
      render: (_, row) =>
        (row?.edgeClusterInfo)
          ? <Row justify='center'>
            <EdgeServiceStatusLight data={row.edgeAlarmSummary} />
          </Row>
          : noDataDisplay
    }
  ]

  const rowActions: TableProps<PersonalIdentityNetworksViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByService(ServiceType.PIN, ServiceOperation.EDIT),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.PIN, ServiceOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getServiceDetailsLink({
            type: ServiceType.PIN,
            oper: ServiceOperation.EDIT,
            serviceId: selectedRows[0].id!
          })}`
        }, { state: { from: location } })
      }
    },
    {
      scopeKey: getScopeKeyByService(ServiceType.PIN, ServiceOperation.DELETE),
      rbacOpsIds: getServiceAllowedOperation(ServiceType.PIN, ServiceOperation.DELETE),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Personal Identity Network' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          okText: $t({ defaultMessage: 'Delete' }),
          onOk: () => {
            deleteEdgePin({ params: { serviceId: rows[0].id } })
              .then(clearSelection)
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
          $t({ defaultMessage: 'Personal Identity Network ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink state={{ from: location }}
            to={getServiceRoutePath({
              type: ServiceType.PIN,
              oper: ServiceOperation.CREATE
            })}
            // eslint-disable-next-line max-len
            scopeKey={getScopeKeyByService(ServiceType.PIN, ServiceOperation.CREATE)}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.PIN, ServiceOperation.CREATE)}
          >
            {/* eslint-disable-next-line max-len */}
            <Button type='primary'>{$t({ defaultMessage: 'Add Personal Identity Network' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isPinDeleting }
      ]}>
        <Table
          settingsId={settingsId}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

export default PersonalIdentityNetworkTableEnhanced
