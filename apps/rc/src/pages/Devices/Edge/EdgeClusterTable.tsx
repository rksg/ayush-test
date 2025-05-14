import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { EdgePermissions }           from '@acx-ui/edge/components'
import { Features }                  from '@acx-ui/feature-toggle'
import {
  EdgeStatusLight,
  useEdgeClusterActions,
  useIsEdgeFeatureReady,
  EdgeClusterStatusLabel
} from '@acx-ui/rc/components'
import { useGetEdgeClusterListForTableQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  CommonOperation,
  Device,
  EdgeClusterTableDataType,
  activeTab,
  allowRebootShutdownForStatus,
  allowSendOtpForStatus,
  allowSendFactoryResetStatus,
  getUrl,
  usePollingTableQuery,
  genUrl,
  CommonCategory,
  EdgeStatusEnum,
  isOtpEnrollmentRequired,
  ClusterHighAvailabilityModeEnum,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes }                             from '@acx-ui/types'
import { filterByAccess, hasPermission }          from '@acx-ui/user'
import { getOpsApi }                              from '@acx-ui/utils'

import { HaStatusBadge } from './HaStatusBadge'

const defaultPayload = {
  fields: [
    'tenantId',
    'clusterId',
    'name',
    'virtualIp',
    'venueId',
    'venueName',
    'clusterStatus',
    'haStatus',
    'edgeList',
    'highAvailabilityMode'
  ]
}

export const EdgeClusterTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const isGracefulShutdownReady = useIsEdgeFeatureReady(Features.EDGE_GRACEFUL_SHUTDOWN_TOGGLE)
  const isEdgeDualWanReady = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const {
    deleteNodeAndCluster,
    reboot,
    shutdown,
    sendEdgeOnboardOtp,
    sendFactoryReset
  } = useEdgeClusterActions()
  const tableQuery = usePollingTableQuery({
    useQuery: useGetEdgeClusterListForTableQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'virtualIp']
    }
  })
  const { venueOptions = [] } = useVenuesListQuery(
    {
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC'
      }
    }, {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map(item => ({ value: item.name, key: item.id }))
        }
      }
    })

  const columns: TableProps<EdgeClusterTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (_, row) => {
        return isEdgeDualWanReady
          ? <TenantLink to={`${getUrl({
            feature: row.isFirstLevel ? Device.EdgeCluster : Device.Edge,
            oper: CommonOperation.Detail,
            params: { id: row.isFirstLevel ? row.clusterId : row.serialNumber } })}/overview`}>
            {row.name}
          </TenantLink>
          : (row.isFirstLevel
            ? row.name
            : <TenantLink to={`${getUrl({
              feature: Device.Edge,
              oper: CommonOperation.Detail,
              params: { id: row.serialNumber } })}/overview`}>
              {row.name}
            </TenantLink>)
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster Status' }),
      key: 'clusterStatus',
      dataIndex: 'clusterStatus',
      sorter: true,
      render: (_, row) => {
        return row.clusterStatus && <EdgeClusterStatusLabel
          clusterStatus={row.clusterStatus}
          edgeList={row.edgeList}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'HA Mode' }),
      key: 'highAvailabilityMode',
      dataIndex: 'highAvailabilityMode',
      render: (_, row) => {
        return row.isFirstLevel && $t(getHaModeDisplayString(row.highAvailabilityMode))
      }
    },
    {
      title: $t({ defaultMessage: 'Node Status' }),
      key: 'deviceStatus',
      dataIndex: 'deviceStatus',
      render: (_, row) => {
        return <EdgeStatusLight data={row.deviceStatus} showText />
      }
    },
    {
      title: $t({ defaultMessage: 'HA Status' }),
      key: 'haStatus',
      dataIndex: 'haStatus',
      align: 'center',
      render: (_, row) => {
        return (
          !row.isFirstLevel &&
          <HaStatusBadge
            haStatus={row.haStatus}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serialNumber',
      dataIndex: 'serialNumber'
    },
    {
      title: $t({ defaultMessage: 'Virtual IP' }),
      key: 'virtualIp',
      dataIndex: 'virtualIp',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      key: 'clusterInterface',
      dataIndex: 'clusterInterface'
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: true,
      filterable: venueOptions,
      filterKey: 'venueId',
      render: (_, row) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      key: 'firmwareVersion',
      dataIndex: 'firmwareVersion',
      sorter: true,
      show: false
    }
  ]

  const rowActions: TableProps<EdgeClusterTableDataType>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: EdgePermissions.editEdgeCluster,
      visible: (selectedRows) => (selectedRows.length === 1),
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        if(selectedRows[0].isFirstLevel) {
          navigate({
            ...basePath,
            pathname:
            `${basePath.pathname}${getUrl({
              feature: Device.EdgeCluster,
              oper: CommonOperation.Edit,
              after: [activeTab],
              params: {
                id: selectedRows[0].clusterId,
                activeTab: 'cluster-details'
              } })}`
          })
        } else {
          navigate({
            ...basePath,
            pathname:
            `${basePath.pathname}${getUrl({
              feature: Device.Edge,
              oper: CommonOperation.Edit,
              after: [activeTab],
              params: {
                id: selectedRows[0].serialNumber,
                activeTab: 'general-settings'
              } })}`
          })
        }
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteEdgeCluster), getOpsApi(EdgeUrlsInfo.deleteEdge)],
      visible: (selectedRows) =>
        (selectedRows.filter(row =>
          row.isFirstLevel && (row.children?.length ?? 0) > 0).length === 0),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        deleteNodeAndCluster(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.sendOtp)],
      visible: (selectedRows) =>
        (selectedRows.filter(row => row.isFirstLevel).length === 0 &&
          selectedRows.filter(row => !allowSendOtpForStatus(row?.deviceStatus)).length === 0 &&
          // eslint-disable-next-line max-len
          selectedRows.filter(row => isOtpEnrollmentRequired(row.serialNumber)).length === selectedRows.length),
      label: $t({ defaultMessage: 'Send OTP' }),
      onClick: (selectedRows, clearSelection) => {
        sendEdgeOnboardOtp(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.factoryReset)],
      visible: (selectedRows) =>
        (selectedRows.filter(row => row.isFirstLevel).length === 0 &&
          selectedRows.filter(row => {
            return !allowSendFactoryResetStatus(row?.deviceStatus)
          }).length === 0),
      label: $t({ defaultMessage: 'Reset & Recover' }),
      onClick: (selectedRows, clearSelection) => {
        sendFactoryReset(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.reboot)],
      visible: (selectedRows) =>
        (selectedRows.filter(row => row.isFirstLevel).length === 0 &&
        selectedRows.filter(row => !allowRebootShutdownForStatus(row?.deviceStatus)).length === 0),
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: (selectedRows, clearSelection) => {
        reboot(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.shutdown)],
      visible: (selectedRows) => (isGracefulShutdownReady &&
        selectedRows.filter(row => row.isFirstLevel).length === 0 &&
        selectedRows.filter(row => !allowRebootShutdownForStatus(row?.deviceStatus)).length === 0),
      label: $t({ defaultMessage: 'Shutdown' }),
      onClick: (selectedRows, clearSelection) => {
        shutdown(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: EdgePermissions.editEdgeClusterConfigWizard,
      visible: (selectedRows) =>
        (selectedRows.length === 1 && Boolean(selectedRows[0]?.isFirstLevel)),
      label: $t({ defaultMessage: 'Run Cluster & RUCKUS Edge configuration wizard' }),
      onClick: (selectedRows) => {
        if(selectedRows[0].isFirstLevel) {
          navigate({
            ...basePath,
            pathname:
              `${basePath.pathname}${genUrl([
                CommonCategory.Device,
                Device.EdgeCluster,
                selectedRows[0].clusterId!,
                'configure'
              ])}`
          })
        } else {
          // do nothing
        }
      },
      disabled: (selectedRows) => {
        const nodeList = selectedRows[0]?.edgeList ?? []
        return !nodeList.length ||
        nodeList.filter(item =>
          item.deviceStatus === EdgeStatusEnum.NEVER_CONTACTED_CLOUD).length > 0
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [EdgeScopes.CREATE, EdgeScopes.UPDATE, EdgeScopes.DELETE],
    rbacOpsIds: [
      ...EdgePermissions.editEdgeCluster,
      ...EdgePermissions.editEdgeClusterConfigWizard,
      getOpsApi(EdgeUrlsInfo.deleteEdgeCluster),
      getOpsApi(EdgeUrlsInfo.deleteEdge),
      getOpsApi(EdgeUrlsInfo.sendOtp),
      getOpsApi(EdgeUrlsInfo.factoryReset),
      getOpsApi(EdgeUrlsInfo.reboot),
      getOpsApi(EdgeUrlsInfo.shutdown)
    ]
  })

  return (
    <Loader states={[tableQuery]}>
      <Table
        settingsId='edge-cluster-table'
        rowKey={(row: EdgeClusterTableDataType) => (row.serialNumber ?? `c-${row.clusterId}`)}
        rowSelection={isSelectionVisible && { type: 'checkbox' }}
        rowActions={filterByAccess(rowActions)}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter
      />
    </Loader>
  )
}

const getHaModeDisplayString = (highAvailabilityMode?: ClusterHighAvailabilityModeEnum) => {
  switch(highAvailabilityMode) {
    case ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE:
      return defineMessage({ defaultMessage: 'Active-Active' })
    case ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY:
      return defineMessage({ defaultMessage: 'Active-Standby' })
    default:
      return defineMessage({ defaultMessage: 'N/A' })
  }
}