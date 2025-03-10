import { useMemo, useState } from 'react'

import { Badge }   from 'antd'
import _, { find } from 'lodash'
import { useIntl } from 'react-intl'

import {
  ColumnState,
  ColumnType,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { EdgePermissions } from '@acx-ui/edge/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useGetEdgeListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  EdgeStatus,
  EdgeStatusEnum,
  EdgeUrlsInfo,
  FILTER,
  SEARCH,
  TABLE_QUERY,
  TableQuery,
  allowRebootShutdownForStatus,
  allowResetForStatus,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes, RequestPayload }             from '@acx-ui/types'
import { filterByAccess }                         from '@acx-ui/user'
import { exportMessageMapping, getOpsApi }        from '@acx-ui/utils'

import { ApCompatibilityFeature }                         from '../ApCompatibility/ApCompatibilityFeature'
import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../Compatibility/Edge/EdgeCompatibilityDrawer'
import { seriesMappingAP }                                from '../DevicesWidget'
import { useEdgeActions, useIsEdgeFeatureReady }          from '../useEdgeActions'

import { EdgeStatusLight } from './EdgeStatusLight'
import { useExportCsv }    from './useExportCsv'

export { EdgeStatusLight } from './EdgeStatusLight'

export interface EdgesTableQueryProps
  extends Omit<TABLE_QUERY<EdgeStatus, RequestPayload<unknown>, unknown>, 'useQuery'>{}

interface EdgesTableProps extends Omit<TableProps<EdgeStatus>, 'columns'> {
  tableQuery?: EdgesTableQueryProps;
  // use column key to filter them out,
  // notice that this is only applied on defaultColumns
  filterColumns?: string[];
  // custom column is optional
  columns?: TableProps<EdgeStatus>['columns']
  incompatibleCheck?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const defaultEdgeTablePayload = {
  fields: [
    'name',
    'deviceStatus',
    'type',
    'model',
    'serialNumber',
    'ip',
    'ports',
    'venueId',
    'venueName',
    'edgeGroupId',
    'tags',
    'firmwareVersion'
  ]
}
const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const EdgesTable = (props: EdgesTableProps) => {
  const {
    settingsId = 'edges-table',
    tableQuery: customTableQuery,
    columns,
    filterColumns,
    incompatibleCheck,
    filterables,
    ...otherProps
  } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const isGracefulShutdownReady = useIsEdgeFeatureReady(Features.EDGE_GRACEFUL_SHUTDOWN_TOGGLE)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)
  // eslint-disable-next-line max-len
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)

  const [ showFeatureCompatibilitiy, setShowFeatureCompatibilitiy ] = useState(false)
  // eslint-disable-next-line max-len
  const [ compatibilitiesDrawerEdgeId, setCompatibilitiesDrawerEdgeId ] = useState<string|undefined>()

  const tableQuery = usePollingTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload: incompatibleCheck
      ? {
        ...defaultEdgeTablePayload,
        fields: (defaultEdgeTablePayload.fields as string[]).concat(
          isEdgeCompatibilityEnhancementEnabled ? ['incompatibleV1_1'] : ['incompatible'])
      }
      : defaultEdgeTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'serialNumber', 'ip']
    },

    pagination: { settingsId },
    ...customTableQuery
  })
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
  }))
  const { venueOptions = [] } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data?.map(item => ({ value: item.name, key: item.id }))
        }
      }
    })

  const { deleteEdges, factoryReset, reboot, shutdown, sendOtp } = useEdgeActions()
  // eslint-disable-next-line max-len
  const { exportCsv, disabled } = useExportCsv<EdgeStatus>(tableQuery as TableQuery<EdgeStatus, RequestPayload<unknown>, unknown>)

  const handleColumnStateChange = (state: ColumnState) => {
    if (isEdgeCompatibilityEnabled) {
      if (showFeatureCompatibilitiy !== state['incompatible']) {
        setShowFeatureCompatibilitiy(state['incompatible'])
      }
    }
  }

  const handleFilterChange = (
    filters: FILTER,
    customSearch: SEARCH
  ) => {
    const customFilters = { ...filters }
    if (filters?.firmwareVersion) {
      customFilters.firmwareVersion = filters.firmwareVersion.slice(1)
    }
    tableQuery.handleFilterChange?.(customFilters, customSearch)
  }

  const defaultColumns: TableProps<EdgeStatus>['columns'] = useMemo(() => [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (_, row) => {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/details/overview`}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'deviceStatus',
      dataIndex: 'deviceStatus',
      sorter: true,
      fixed: 'left',
      filterable: statusFilterOptions,
      filterKey: 'deviceStatusSeverity',
      render: (_, row) => {
        return (
          <EdgeStatusLight data={row.deviceStatus} showText={true} />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serialNumber',
      dataIndex: 'serialNumber',
      sorter: true,
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: true,
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Ports' }),
      key: 'ports',
      dataIndex: 'ports',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venue',
      dataIndex: ['venueName'],
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
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // },
    {
      title: $t({ defaultMessage: 'Version' }),
      key: 'firmwareVersion',
      dataIndex: 'firmwareVersion',
      sorter: true,
      show: false
    },
    ...(isEdgeCompatibilityEnabled && incompatibleCheck ? [{
      key: 'incompatible',
      // eslint-disable-next-line max-len
      tooltip: $t({ defaultMessage: 'Check for the RUCKUS Edge features of <venueSingular></venueSingular> not supported by earlier versions.' }),
      title: $t({ defaultMessage: 'Feature Compatibility' }),
      filterPlaceholder: $t({ defaultMessage: 'Feature Incompatibility' }),
      filterValueArray: true,
      dataIndex: 'incompatible',
      filterKey: 'firmwareVersion',
      width: 200,
      filterableWidth: 200,
      // eslint-disable-next-line max-len
      filterable: showFeatureCompatibilitiy && filterables ? filterables['featureIncompatible']: false,
      filterMultiple: false,
      show: false,
      sorter: false,
      render: (_: React.ReactNode, row: EdgeStatus) => {
        return (<ApCompatibilityFeature
          count={row?.incompatible}
          deviceStatus={row?.deviceStatus}
          onClick={() => {
            setCompatibilitiesDrawerEdgeId(row.serialNumber)
          }} />
        )
      }
    }] : [])
  ], [showFeatureCompatibilitiy, statusFilterOptions, venueOptions, incompatibleCheck])

  if (filterColumns) {
    filterColumns.forEach((columnTofilter) => {
      _.remove(defaultColumns, { key: columnTofilter })
    })
  }

  const rowActions: TableProps<EdgeStatus>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: EdgePermissions.editEdgeNode,
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/devices/edge/${selectedRows[0].serialNumber}/edit/general-settings`
        })
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteEdge)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        deleteEdges(rows, clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.reboot)],
      visible: (selectedRows) => (selectedRows.length === 1 &&
        allowRebootShutdownForStatus(selectedRows[0]?.deviceStatus)),
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: (rows, clearSelection) => {
        reboot(rows[0], clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.shutdown)],
      visible: (selectedRows) => (isGracefulShutdownReady && selectedRows.length === 1 &&
        allowRebootShutdownForStatus(selectedRows[0]?.deviceStatus)),
      label: $t({ defaultMessage: 'Shutdown' }),
      onClick: (rows, clearSelection) => {
        shutdown(rows[0], clearSelection)
      }
    },
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.sendOtp)],
      visible: (selectedRows) => (selectedRows.length === 1 &&
        EdgeStatusEnum.NEVER_CONTACTED_CLOUD === selectedRows[0]?.deviceStatus),
      label: $t({ defaultMessage: 'Send OTP' }),
      onClick: (rows, clearSelection) => {
        sendOtp(rows[0], clearSelection)
      }
    },{
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.factoryReset)],
      visible: (selectedRows) => (
        selectedRows.length === 1 &&
        allowResetForStatus(selectedRows[0]?.deviceStatus)
      ),
      label: $t({ defaultMessage: 'Reset & Recover' }),
      onClick: (rows, clearSelection) => {
        factoryReset(rows[0], clearSelection)
      }
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Table
        settingsId={settingsId}
        rowKey='serialNumber'
        rowActions={filterByAccess(rowActions)}
        columns={columns ?? defaultColumns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        columnState={isEdgeCompatibilityEnabled?{ onChange: handleColumnStateChange } : {}}
        enableApiFilter
        iconButton={(exportDevice && false) ? {
          icon: <DownloadOutlined />,
          disabled,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: exportCsv
        } : undefined}
        {...otherProps}
      />
      {isEdgeCompatibilityEnabled && <EdgeCompatibilityDrawer
        visible={!!compatibilitiesDrawerEdgeId}
        title={$t({ defaultMessage: 'Incompatibility Details: {edgeName}' },
          { edgeName:
            find(tableQuery?.data?.data, { serialNumber: compatibilitiesDrawerEdgeId })?.name
          })}
        type={EdgeCompatibilityType.DEVICE}
        onClose={() => setCompatibilitiesDrawerEdgeId(undefined)}
        // eslint-disable-next-line max-len
        venueId={find(tableQuery?.data?.data, { serialNumber: compatibilitiesDrawerEdgeId })?.venueId}
        edgeId={compatibilitiesDrawerEdgeId}
      />}
    </Loader>
  )
}
