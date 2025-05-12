/* eslint-disable max-len */
import React, { ReactNode, Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'

import { FetchBaseQueryError }  from '@reduxjs/toolkit/query'
import { Badge, Divider, Form } from 'antd'
import { find }                 from 'lodash'
import { useIntl }              from 'react-intl'
import styled                   from 'styled-components/macro'

import {
  ColumnState,
  Loader,
  Table,
  TableProps,
  Tooltip,
  cssStr,
  showToast
} from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import {
  Features, TierFeatures,
  useIsSplitOn, useIsTierAllowed
} from '@acx-ui/feature-toggle'
import { formatter } from '@acx-ui/formatter'
import {
  CheckMark,
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useApGroupsListQuery,
  useGetApGroupsTemplateListQuery,
  useImportApMutation,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApCompatibilitiesQuery,
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyImportResultQuery,
  useNewApListQuery,
  useWifiCapabilitiesQuery
} from '@acx-ui/rc/services'
import {
  AFCPowerStateRender,
  AFCStatusRender,
  APMeshRole,
  ApCompatibility,
  ApCompatibilityResponse,
  ApDeviceStatusEnum,
  ApExtraParams,
  CommonResult,
  FILTER,
  ImportErrorRes,
  NewAPExtendedGrouped,
  NewAPModelExtended,
  SEARCH,
  TableQuery,
  TableResult,
  transformDisplayNumber,
  transformDisplayText,
  usePollingTableQuery,
  PowerSavingStatusEnum,
  IncompatibleFeatureLevelEnum,
  CompatibilityResponse,
  Compatibility,
  CompatibilitySelectedApInfo,
  WifiRbacUrlsInfo,
  useConfigTemplateQueryFnSwitcher,
  ApGroupViewModel,
  NewAPModel
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useParams, useTenantLink }    from '@acx-ui/react-router-dom'
import { RequestPayload, WifiScopes, RolesEnum }                             from '@acx-ui/types'
import { filterByAccess, hasPermission }                                     from '@acx-ui/user'
import { exportMessageMapping, getOpsApi, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { ApCompatibilityDrawer, ApCompatibilityFeature, ApCompatibilityType } from '../ApCompatibility'
import { ApGeneralCompatibilityDrawer as EnhancedApCompatibilityDrawer }      from '../Compatibility'
import { seriesMappingAP }                                                    from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType }                    from '../ImportFileDrawer'
import { useApActions }                                                       from '../useApActions'
import { useIsEdgeFeatureReady }                                              from '../useEdgeActions'
import { VenueSelector }                                                      from '../VenueSelector'

import { getGroupableConfig } from './newGroupByConfig'
import { useExportCsv }       from './useExportCsv'
import { useFilters }         from './useFilters'

import { APStatus, ApTableProps, ApTableRefType, channelTitleMap, retriedApIds, transformMeshRole } from '.'

interface ImportFileFormType {
  venueId: string
}

export const newDefaultApPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'networkStatus.ipAddress', 'macAddress', 'tags', 'serialNumber'],
  fields: [
    'name', 'status', 'model', 'networkStatus', 'macAddress', 'venueName',
    'switchName', 'meshRole', 'clientCount', 'apGroupId', 'apGroupName',
    'lanPortStatuses', 'tags', 'serialNumber', 'radioStatuses',
    'venueId', 'poePort', 'firmwareVersion', 'uptime', 'afcStatus',
    'powerSavingStatus'
  ]
}

const DefaultSelectedApInfo = {
  serialNumber: '',
  name: '',
  model: '',
  firmwareVersion: ''
} as CompatibilitySelectedApInfo

export const GroupRowWrapper = styled.div`
  .ant-pro-table {
    .ant-table {
      .parent-row-data {
        .ant-table-cell-with-append {
          .ant-table-row-expand-icon {
            display: block;
            left: -32px;
          }
        }
      }
    }
  }
`

export const NewApTable = forwardRef((props: ApTableProps<NewAPModelExtended|NewAPExtendedGrouped>, ref?: Ref<ApTableRefType>) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { filters, isNetworkLoading } = useFilters(params)
  const { searchable, filterables, enableGroups=true, enableApCompatibleCheck=false, settingsId = 'ap-table' } = props
  const [ compatibilitiesDrawerVisible, setCompatibilitiesDrawerVisible ] = useState(false)
  const [ selectedApInfo, setSelectedApInfo ] = useState<CompatibilitySelectedApInfo>(DefaultSelectedApInfo)
  const [ tableData, setTableData ] = useState([] as (NewAPModelExtended|NewAPExtendedGrouped)[])
  const [ hasGroupBy, setHasGroupBy ] = useState(false)
  const [ showFeatureCompatibilitiy, setShowFeatureCompatibilitiy ] = useState(false)
  const secureBootFlag = useIsSplitOn(Features.WIFI_EDA_SECURE_BOOT_TOGGLE)
  const AFC_Featureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'
  const apUptimeFlag = useIsSplitOn(Features.AP_UPTIME_TOGGLE)
  const apMgmtVlanFlag = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)
  const apTxPowerFlag = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const operationRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]

  // old API
  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  // new API
  const [ getApCompatibilities] = useLazyGetApCompatibilitiesQuery()

  const { data: wifiCapabilities } = useWifiCapabilitiesQuery({ params: { }, enableRbac: true })

  const apListTableQuery = usePollingTableQuery({
    useQuery: useNewApListQuery,
    defaultPayload: {
      ...newDefaultApPayload,
      filters
    },
    search: {
      searchTargetFields: newDefaultApPayload.searchTargetFields,
      searchString: ''
    },
    option: { skip: Boolean(props.tableQuery) || isNetworkLoading },
    // enableSelectAllPagesData: ['id', 'name', 'serialNumber', 'apGroupId',
    //   'status', 'firmwareVersion'],
    pagination: { settingsId }
  })

  const { data: apGroupInfo } = useConfigTemplateQueryFnSwitcher<TableResult<ApGroupViewModel>>({
    useQueryFn: useApGroupsListQuery,
    useTemplateQueryFn: useGetApGroupsTemplateListQuery,
    payload: {
      searchString: '',
      fields: [ 'id', 'venueId'],
      pageSize: 10000
    },
    enableRbac: true
  })

  const tableQuery = props.tableQuery || apListTableQuery

  useEffect(() => {
    if(!Boolean(filters) || Object.keys(filters).length === 0) return
    tableQuery.setPayload({ ...tableQuery.payload, filters } as typeof apListTableQuery.payload)
  }, [filters])

  useEffect(() => {
    const fetchApCompatibilitiesAndSetData = async () => {
      const result:React.SetStateAction<(NewAPModelExtended|NewAPExtendedGrouped)[]> = []
      const apIdsToIncompatible:{ [key:string]: number } = {}

      if (tableQuery.data?.data) {
        let apIds:string[] = []

        const aps = tableQuery.data as TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>
        apIds = retriedApIds(aps, !!hasGroupBy)

        if (apIds.length > 0) {
          if (isApCompatibilitiesByModel) {
            let compatibilitiesResponse: CompatibilityResponse = {} as CompatibilityResponse
            let compatibilities: Compatibility[] = []
            try {
              if (params.venueId) {
                compatibilitiesResponse = await getApCompatibilities({
                  params: {},
                  payload: {
                    filters: {
                      apIds: apIds,
                      venueIds: [params.venueId],
                      featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
                    },
                    page: 1,
                    pageSize: 10
                  }
                }).unwrap()
              } else if (params.networkId) {
                compatibilitiesResponse = await getApCompatibilities({
                  params: {},
                  payload: {
                    filters: {
                      apIds: apIds,
                      wifiNetworkIds: [params.networkId],
                      featureLevels: [IncompatibleFeatureLevelEnum.WIFI_NETWORK]
                    },
                    page: 1,
                    pageSize: 10
                  }
                }).unwrap()
              }

              compatibilities = compatibilitiesResponse?.compatibilities

              if (compatibilities?.length > 0) {
                apIds.forEach((id:string) => {
                  const apIncompatible = find(compatibilities, ap => id===ap.id)
                  if (apIncompatible) {
                    const { incompatibleFeatures, incompatible } = apIncompatible
                    apIdsToIncompatible[id] = incompatibleFeatures?.length ?? incompatible ?? 0
                  }
                })
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('fetchApCompatibilitiesAndSetData error:', e)
            }
          } else {
            let apCompatibilitiesResponse:ApCompatibilityResponse = { apCompatibilities: [] }
            let apCompatibilities:ApCompatibility[] = []
            try {
              if (params.venueId) {
                apCompatibilitiesResponse = await getApCompatibilitiesVenue({
                  params: { venueId: params.venueId },
                  payload: { filters: { apIds } }
                }).unwrap()

              } else if (params.networkId) {
                apCompatibilitiesResponse = await getApCompatibilitiesNetwork({
                  params: { networkId: params.networkId },
                  payload: { filters: { apIds } }
                }).unwrap()
              }

              apCompatibilities = apCompatibilitiesResponse.apCompatibilities
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('fetchApCompatibilitiesAndSetData error:', e)
            }

            if (apCompatibilities?.length > 0) {
              apIds.forEach((id:string) => {
                const apIncompatible = find(apCompatibilities, ap => id===ap.id)
                if (apIncompatible) {
                  apIdsToIncompatible[id] = apIncompatible?.incompatibleFeatures?.length ?? apIncompatible?.incompatible ?? 0
                }
              })
            }
          }
        }
        if (Object.keys(apIdsToIncompatible).length > 0) {
          // TODO Need more discuss wether groupBy feature is necessary
          if (hasGroupBy) {
            tableQuery.data.data?.forEach(item => {
              const children = (item as unknown as { aps: NewAPModelExtended[] }).aps?.map(ap => ({
                ...ap,
                incompatible: apIdsToIncompatible[ap.serialNumber]
              }))
              result.push({ ...item, aps: children, children })
            })
          } else {
            tableQuery.data.data?.forEach(ap => (result.push({
              ...ap,
              incompatible: apIdsToIncompatible[ap.serialNumber]
            })))
          }
          setTableData(result)
        } else {
          setTableData(
            addNetworksInfoByApGroup(tableQuery.data.data, apGroupInfo)
          )
        }
      }
    }

    const addNetworksInfoByApGroup = (data: NewAPExtendedGrouped[] | NewAPModelExtended[], apGroupInfo: TableResult<ApGroupViewModel> | undefined) => {
      return data.map(ap => {
        return {
          ...ap,
          networksInfo: apGroupInfo?.data.filter((group) => {
            return group.id === ap.apGroupId && group.venueId === (ap as { children?: NewAPModel[] }).children?.[0]?.venueId
          })?.[0]?.networks
        }
      })
    }

    if (tableQuery.data) {
      if (enableApCompatibleCheck && showFeatureCompatibilitiy) {
        fetchApCompatibilitiesAndSetData()
      } else {
        setTableData(
          addNetworksInfoByApGroup(tableQuery.data.data, apGroupInfo)
        )
      }
    }
  }, [tableQuery.data, showFeatureCompatibilitiy, apGroupInfo])

  const apAction = useApActions()
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
  }))
  const linkToEditAp = useTenantLink('/devices/wifi/')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAPOutdoor = (model: string): boolean | undefined => {
    const currentApModel = wifiCapabilities?.apModels?.find((apModel) => apModel.model === model)
    return currentApModel?.isOutdoor
  }

  const columns = useMemo(() => {
    const extraParams = tableQuery?.data?.extra ?? {
      channel24: false,
      channel50: false,
      channelL50: false,
      channelU50: false,
      channel60: false
    }

    const actualTxPowerChannelMap = {
      channel24: 'actualTxPower24',
      channel50: 'actualTxPower50',
      channelL50: 'actualTxPowerL50',
      channelU50: 'actualTxPowerU50',
      channel60: 'actualTxPower60'
    }

    const columns: TableProps<NewAPModelExtended|NewAPExtendedGrouped>['columns'] = [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      render: (_, row, __, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {searchable ? highlightFn(row.name || '--') : row.name}</TenantLink>
      )
    }, {
      key: 'status',
      width: 200,
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      fixed: 'left',
      filterKey: 'statusSeverity',
      filterable: filterables ? statusFilterOptions : false,
      groupable: enableGroups ?
        filterables && getGroupableConfig()?.deviceStatusGroupableOptions : undefined,
      render: (_, { status, powerSavingStatus }) =>
        <APStatus status={status as ApDeviceStatusEnum} powerSavingStatus={powerSavingStatus as PowerSavingStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      searchable: searchable,
      sorter: true,
      groupable: enableGroups ?
        filterables && getGroupableConfig()?.modelGroupableOptions : undefined
    }, {
      key: 'networkStatus.ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: ['networkStatus', 'ipAddress'],
      searchable: searchable,
      sorter: true
    }, {
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      searchable: searchable,
      sorter: true
    },
    // TODO:  Waiting for backend support
    // {
    //   key: 'incidents',
    //   title: () => (
    //     <>
    //       { $t({ defaultMessage: 'Incidents' }) }
    //       <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
    //     </>
    //   ),
    //   dataIndex: 'incidents',
    //   sorter: false,
    //   render: (data, row) => {
    //     //TODO: Shows breakdown by severity - with a counter for each severity
    //     return (<Space direction='horizontal'>
    //       <StackedBarChart
    //         style={{ height: 10, width: 40 }}
    //         data={[{
    //           category: 'emptyStatus',
    //           series: [{
    //             name: '',
    //             value: 1
    //           }]
    //         }]}
    //         showTooltip={false}
    //         showLabels={false}
    //         showTotal={false}
    //         barColors={[cssStr(deviceStatusColors.empty)]}
    //       />
    //       <TenantLink to={`/devices/wifi/${row.serialNumber}/details/analytics/incidents/overview`}>
    //         {data ? data: 0}
    //       </TenantLink>
    //     </Space>)
    //   }
    // },
    ...((params.venueId || params.apGroupId) ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      filterKey: 'venueId',
      filterable: filterables ? filterables['venueId'] : false,
      render: (_: ReactNode, row: NewAPModelExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    }]),
    ...(params.apGroupId ? [] : [{
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (_: ReactNode, row: NewAPModelExtended ) => {
        const { switchId, switchSerialNumber, switchName } = row
        return (
          <TenantLink to={`/devices/switch/${switchId}/${switchSerialNumber}/details/overview`}>
            {switchName}
          </TenantLink>
        )
      }
    }]),
    {
      key: 'meshRole',
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: (_: ReactNode, { meshRole }) => transformMeshRole(meshRole as APMeshRole)
    }, {
      key: 'clientCount',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clientCount',
      align: 'center',
      render: (_: ReactNode, row: NewAPModelExtended) => {
        return <TenantLink to={`/devices/wifi/${row.serialNumber}/details/clients`}>
          {transformDisplayNumber(row.clientCount)}
        </TenantLink>
      }
    },
    ...(params.apGroupId ? [] : [{
      key: 'apGroupId',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'apGroupId',
      filterKey: 'apGroupId',
      filterable: filterables ? filterables['deviceGroupId'] : false,
      sorter: true,
      groupable: enableGroups
        ? filterables && getGroupableConfig(apAction)?.deviceGroupNameGroupableOptions
        : undefined,
      render: (_: ReactNode, row: NewAPModelExtended) => row.apGroupName
    }]),
    {
      key: 'rf-channels',
      dataIndex: 'rf-channels',
      title: $t({ defaultMessage: 'RF Channels' }),
      children: Object.entries(extraParams).reduce((acc, [channel, visible]) => {
        if (!visible) return acc
        const key = channel as keyof ApExtraParams
        acc.push({
          key: channel,
          width: 80,
          dataIndex: channel,
          title: <Table.SubTitle children={channelTitleMap[key]} />,
          align: 'center',
          render: (_, row: NewAPModelExtended) =>
            transformDisplayText(row[key] as string)
        })
        return acc
      }, [] as TableProps<NewAPModelExtended|NewAPExtendedGrouped>['columns'])
    },
    ...(apUptimeFlag ? [
      {
        key: 'uptime',
        title: $t({ defaultMessage: 'Up Time' }),
        dataIndex: 'uptime',
        sorter: true,
        render: (data: ReactNode, row: NewAPModelExtended) => {
          const uptime = row?.uptime
          return (uptime ? formatter('longDurationFormat')(uptime * 1000) : null)
        }
      }] : []),
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      searchable: searchable,
      sorter: true,
      render: (data: ReactNode, row: NewAPModelExtended) => (
        row.tags?.join(', ')
      )
    }, {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      show: false,
      searchable: searchable,
      sorter: true
    }, {
      key: 'firmwareVersion',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'firmwareVersion',
      show: false,
      sorter: true
    }, {
      key: 'poePort',
      title: $t({ defaultMessage: 'PoE Port' }),
      dataIndex: 'poePort',
      show: false,
      sorter: false,
      render: (_, row: NewAPModelExtended) => {
        if (!row.hasPoeStatus) {
          return <span></span>
        }

        const iconColor = (row.isPoEStatusUp) ? '--acx-semantics-green-50' : '--acx-neutrals-50'
        return (
          <span>
            <Badge color={`var(${iconColor})`}
              text={transformDisplayText(row.poePortInfo)}
            />
          </span>
        )
      }
    },
    ...(secureBootFlag && enableAP70 ? [
      {
        key: 'supportSecureBoot',
        title: $t({ defaultMessage: 'Secure Boot' }),
        dataIndex: 'supportSecureBoot',
        show: false,
        sorter: false,
        render: (data: ReactNode, row: NewAPModelExtended) => {
          const secureBootEnabled = row.supportSecureBoot || false
          return (secureBootEnabled ? <CheckMark /> : null)
        }
      }] : []),
    ...(apMgmtVlanFlag ? [
      {
        key: 'networkStatus.managementTrafficVlan',
        title: $t({ defaultMessage: 'Management VLAN' }),
        dataIndex: 'networkStatus.managementTrafficVlan',
        show: false,
        sorter: false,
        render: (data: ReactNode, row: NewAPModelExtended) => {
          const mgmtVlanId = row.networkStatus?.managementTrafficVlan
          return (mgmtVlanId ? mgmtVlanId : null)
        }
      }] : []),
    ...(AFC_Featureflag ? [{
      key: 'afcStatus',
      title: $t({ defaultMessage: 'AFC Status' }),
      dataIndex: ['apStatusData','afcInfo','powerMode'],
      show: false,
      sorter: false,
      width: 200,
      render: (data: ReactNode, row: NewAPModelExtended) => {
        const apRadioDeploy = row.radioStatuses?.length === 3 ? '2-5-6' : ''
        return AFCStatusRender(row.afcStatus, apRadioDeploy)
      }
    },
    {
      key: 'afcPowerMode',
      title: $t({ defaultMessage: 'AFC Power State' }),
      dataIndex: ['apStatusData','afcInfo','powerMode'],
      show: false,
      sorter: false,
      width: 200,
      render: (data: ReactNode, row: NewAPModelExtended) => {
        const apRadioDeploy = row.radioStatuses?.length === 3 ? '2-5-6' : ''
        const status = AFCPowerStateRender(row.afcStatus, apRadioDeploy)
        return (
          <>
            {status.columnText}
            {/* eslint-disable-next-line*/}
            {(status.columnText !== '--' && status.columnText === 'Low Power Indoor' && status.tooltipText) && <Tooltip.Info
              placement='bottom'
              iconStyle={{ height: '12px', width: '12px', marginBottom: '-3px' }}
              title={status.tooltipText}
            />}
          </>
        )
      }
    }
    ]: []),
    ...(enableApCompatibleCheck ? [{
      key: 'incompatible',
      tooltip: $t({ defaultMessage: 'Check for the Wi-Fi features of <venueSingular></venueSingular> not supported by earlier versions or AP models.' }),
      title: $t({ defaultMessage: 'Feature Compatibility' }),
      filterPlaceholder: $t({ defaultMessage: 'Feature Incompatibility' }),
      filterValueArray: true,
      dataIndex: 'incompatible',
      filterKey: 'firmwareVersion',
      width: 200,
      filterableWidth: 200,
      filterable: showFeatureCompatibilitiy && filterables ? filterables['featureIncompatible']: false,
      filterMultiple: false,
      show: false,
      sorter: false,
      render: (_: ReactNode, row: NewAPModelExtended) => {
        const { incompatible, status } = row || {}
        return (<ApCompatibilityFeature
          count={incompatible}
          deviceStatus={status}
          onClick={() => {
            const { serialNumber, name='', model='', firmwareVersion='' } = row || {}
            setSelectedApInfo({ serialNumber, name, model, firmwareVersion })
            setCompatibilitiesDrawerVisible(true)
          }} />
        )
      }
    }] : []),
    ...(apTxPowerFlag ? [{
      key: 'actualTxPower',
      dataIndex: 'actualTxPower',
      title: $t({ defaultMessage: 'Tx Power' }),
      show: false,
      sorter: false,
      children: Object.entries(extraParams).reduce((acc, [channel, visible]) => {
        if (!visible) return acc
        const channelKey = channel as keyof ApExtraParams
        const key = actualTxPowerChannelMap[channelKey]
        acc.push({
          key: key,
          width: 80,
          dataIndex: key,
          title: <Table.SubTitle children={channelTitleMap[channelKey]} />,
          align: 'center'
        })
        return acc
      }, [] as TableProps<NewAPModelExtended|NewAPExtendedGrouped>['columns'])
    }] : [])
    ]
    return columns
  }, [$t, tableQuery.data?.extra, showFeatureCompatibilitiy])

  const isActionVisible = (
    selectedRows: NewAPModelExtended[],
    { selectOne, deviceStatus }: { selectOne?: boolean, deviceStatus?: string[] }) => {
    let visible = true
    if (selectOne) {
      visible = selectedRows.length === 1
    }
    if (visible && deviceStatus && deviceStatus.length > 0) {
      visible = selectedRows.every(ap => ap.status && deviceStatus.includes(ap.status))
    }
    return visible
  }

  const rowActions: TableProps<NewAPModelExtended>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE],
    roles: [...operationRoles],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.updateAp)],
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      navigate(`${linkToEditAp.pathname}/${rows[0].serialNumber}/edit/general`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE],
    roles: [...operationRoles],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.deleteAp)],
    onClick: async (rows, clearSelection) => {
      apAction.showDeleteAps(rows, params.tenantId, clearSelection)
    }
  }, {
    // ACX-25402: Waiting for integration with group by table
    //   label: $t({ defaultMessage: 'Delete AP Group' }),
    //   onClick: async (rows, clearSelection) => {
    //     apAction.showDeleteApGroups(rows, params.tenantId, clearSelection)
    //   }
    // }, {
    label: $t({ defaultMessage: 'Reboot' }),
    scopeKey: [WifiScopes.UPDATE],
    roles: [...operationRoles],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.updateAp)],
    visible: (rows) => isActionVisible(rows, { selectOne: true, deviceStatus: [ ApDeviceStatusEnum.OPERATIONAL ] }),
    onClick: (rows, clearSelection) => {
      const showSendingToast = () => {
        showToast({
          type: 'success',
          content: $t(
            { defaultMessage: 'Sending command: [reboot] to the AP: {ap}' },
            { ap: rows[0]?.serialNumber }
          )
        })
      }
      const callback = () => {
        clearSelection()
        showSendingToast()
      }
      apAction.showRebootAp(rows[0].serialNumber, params.tenantId, rows[0].venueId, callback)
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    scopeKey: [WifiScopes.READ],
    roles: [RolesEnum.READ_ONLY, ...operationRoles],
    visible: (rows) => isActionVisible(rows, { selectOne: true, deviceStatus: [ ApDeviceStatusEnum.OPERATIONAL, ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED ] }),
    onClick: (rows) => {
      apAction.showDownloadApLog(rows[0].serialNumber, params.tenantId, rows[0].venueId)
    }
  }]

  const [ isImportResultLoading, setIsImportResultLoading ] = useState(false)
  const [ importVisible, setImportVisible ] = useState(false)
  const [ importCsv ] = useImportApMutation()
  const [ importQuery ] = useLazyImportResultQuery()
  const [ importResult, setImportResult ] = useState<ImportErrorRes>({} as ImportErrorRes)
  const [ importErrors, setImportErrors ] = useState<FetchBaseQueryError>({} as FetchBaseQueryError)
  const importTemplateLink = 'assets/templates/new_aps_import_template_with_gps.csv'
  // eslint-disable-next-line max-len
  const { exportCsv, disabled } = useExportCsv<NewAPModelExtended>(tableQuery as TableQuery<NewAPModelExtended, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)

  useEffect(()=>{
    setIsImportResultLoading(false)
    if (importResult?.fileErrorCount === 0) {
      setImportVisible(false)
    } else {
      setImportErrors({ data: importResult } as FetchBaseQueryError)
    }
  },[importResult])

  useImperativeHandle(ref, () => ({
    openImportDrawer: () => {
      setImportVisible(true)
    }
  }))

  const basePath = useTenantLink('/devices')
  const handleTableChange: TableProps<NewAPModelExtended>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    const customSorter = Array.isArray(sorter)
      ? sorter[0] : sorter

    tableQuery.handleTableChange?.(pagination, filters, customSorter, extra)
  }

  const handleFilterChange = (
    customFilters: FILTER,
    customSearch: SEARCH,
    groupBy?: string | undefined
  ) => {
    setHasGroupBy(!!groupBy)
    tableQuery.handleFilterChange?.(customFilters, customSearch, groupBy)
  }

  const handleColumnStateChange = (state: ColumnState) => {
    if (enableApCompatibleCheck) {
      if (showFeatureCompatibilitiy !== state['incompatible']) {
        setShowFeatureCompatibilitiy(state['incompatible'])
      }
    }
  }

  useTrackLoadTime({
    itemName: widgetsMapping.AP_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  const allowedRowActions = rowActions?.filter((item) => {
    const { scopeKey: scopes, rbacOpsIds, roles } = item
    return hasPermission({ scopes, rbacOpsIds, roles })
  })

  return (
    <Loader states={[tableQuery]}>
      <GroupRowWrapper>
        <Table<NewAPModelExtended|NewAPExtendedGrouped>
          {...props}
          settingsId={settingsId}
          columns={columns}
          columnState={enableApCompatibleCheck?{ onChange: handleColumnStateChange } : {}}
          dataSource={tableData}
          // getAllPagesData={tableQuery.getAllPagesData}
          rowKey='serialNumber'
          pagination={tableQuery.pagination}
          onChange={handleTableChange}
          onFilterChange={handleFilterChange}
          enableApiFilter={true}
          rowActions={allowedRowActions}
          actions={props.enableActions ? filterByAccess([{
            label: $t({ defaultMessage: 'Add AP' }),
            scopeKey: [WifiScopes.CREATE],
            rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addAp)],
            onClick: () => {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/wifi/add`
              }, { state: { venueId: params.venueId } })
            }
          }, {
            label: $t({ defaultMessage: 'Add AP Group' }),
            scopeKey: [WifiScopes.CREATE],
            rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addApGroup)],
            onClick: () => {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/apgroups/add`
              }, { state: {
                venueId: params.venueId,
                history: location.pathname
              } })
            }
          }, {
            label: $t({ defaultMessage: 'Import APs' }),
            scopeKey: [WifiScopes.CREATE],
            rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addAp)],
            onClick: () => {
              setImportVisible(true)
            }
          }]) : []}
          searchableWidth={260}
          filterableWidth={150}
          iconButton={exportDevice ? {
            icon: <DownloadOutlined />,
            disabled,
            onClick: exportCsv,
            tooltip: $t(exportMessageMapping.EXPORT_TO_CSV)
          } : undefined
          }
        />
        <ImportFileDrawer
          type={ImportFileDrawerType.AP}
          title={$t({ defaultMessage: 'Import APs from file' })}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['csv']}
          templateLink={importTemplateLink}
          visible={importVisible}
          isLoading={isImportResultLoading}
          importError={importErrors}
          importRequest={(formData, values) => {
            setIsImportResultLoading(true)
            importCsv({
              params: { venueId: (values as ImportFileFormType).venueId },
              payload: formData,
              callback: async (res: CommonResult) => {
                const result = await importQuery(
                  {
                    params: { venueId: (values as ImportFileFormType).venueId },
                    payload: { requestId: res.requestId },
                    enableRbac: true
                  }, true)
                  .unwrap()
                setImportResult(result)
              },
              enableRbac: true
            }).unwrap().catch(() => {
              setIsImportResultLoading(false)
            })
          }}
          onClose={() => setImportVisible(false)}>
          <div style={{ display: params.venueId ? 'none' : 'block' }}>
            <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-30') }}/>
            <Form.Item
              name={'venueId'}
              label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
              rules={[{ required: true }]}
              initialValue={params.venueId}
              children={<VenueSelector />}
            />
          </div>
        </ImportFileDrawer>
        {!isEdgeCompatibilityEnabled && <ApCompatibilityDrawer
          visible={compatibilitiesDrawerVisible}
          type={params.venueId?ApCompatibilityType.VENUE:ApCompatibilityType.NETWORK}
          venueId={params.venueId}
          networkId={params.networkId}
          apIds={selectedApInfo?.serialNumber ? [selectedApInfo.serialNumber] : []}
          apName={selectedApInfo?.name}
          isMultiple
          onClose={() => setCompatibilitiesDrawerVisible(false)}
        />}
        {isEdgeCompatibilityEnabled && <EnhancedApCompatibilityDrawer
          visible={compatibilitiesDrawerVisible}
          isMultiple
          type={params.venueId?ApCompatibilityType.VENUE:ApCompatibilityType.NETWORK}
          venueId={params.venueId}
          networkId={params.networkId}
          apInfo={selectedApInfo}
          onClose={() => setCompatibilitiesDrawerVisible(false)}
        />}
      </GroupRowWrapper>
    </Loader>
  )
})
