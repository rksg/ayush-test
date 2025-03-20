/* eslint-disable max-len */
import React, { Ref, forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Badge }               from 'antd'
import { find }                from 'lodash'
import { useIntl }             from 'react-intl'

import {
  ColumnState,
  Loader,
  Table,
  TableProps,
  Tooltip,
  showToast
} from '@acx-ui/components'
import { get }                      from '@acx-ui/config'
import {
  Features, TierFeatures,
  useIsSplitOn, useIsTierAllowed
} from '@acx-ui/feature-toggle'
import { formatter }  from '@acx-ui/formatter'
import {
  CheckMark,
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useApListQuery,
  useImportApMutation,
  useLazyGetApCompatibilitiesNetworkQuery,
  useLazyGetApCompatibilitiesVenueQuery,
  useLazyImportResultQuery,
  useWifiCapabilitiesQuery
} from '@acx-ui/rc/services'
import {
  AFCPowerStateRender,
  AFCStatusRender,
  APExtended,
  APExtendedGrouped,
  APMeshRole,
  ApCompatibility,
  ApCompatibilityResponse,
  ApDeviceStatusEnum,
  ApExtraParams,
  CommonResult,
  CompatibilitySelectedApInfo,
  FILTER,
  ImportErrorRes,
  PowerSavingStatusEnum,
  SEARCH,
  TableQuery,
  TableResult,
  getFilters,
  transformDisplayNumber,
  transformDisplayText,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload, WifiScopes }                                     from '@acx-ui/types'
import { filterByAccess }                                                 from '@acx-ui/user'
import { AccountVertical, exportMessageMapping, getJwtTokenPayload }      from '@acx-ui/utils'

import { ApCompatibilityDrawer, ApCompatibilityFeature, ApCompatibilityType } from '../ApCompatibility'
import { ApGeneralCompatibilityDrawer as EnhancedApCompatibilityDrawer }      from '../Compatibility'
import { seriesMappingAP }                                                    from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType }                    from '../ImportFileDrawer'
import { useApActions }                                                       from '../useApActions'
import { useIsEdgeFeatureReady }                                              from '../useEdgeActions'

import {
  getGroupableConfig, groupedFields
} from './config'
import { ApsTabContext } from './context'
import { useExportCsv }  from './useExportCsv'

import { APStatus, ApTableProps, ApTableRefType, channelTitleMap, defaultApPayload, retriedApIds, transformMeshRole } from '.'

const DefaultSelectedApInfo = {
  serialNumber: '',
  name: '',
  model: '',
  firmwareVersion: ''
} as CompatibilitySelectedApInfo

export const OldApTable = forwardRef((props: ApTableProps<APExtended|APExtendedGrouped>, ref?: Ref<ApTableRefType>) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { searchable, filterables, enableGroups=true, enableApCompatibleCheck=false, settingsId = 'ap-table' } = props
  const { setApsCount } = useContext(ApsTabContext)
  const [ compatibilitiesDrawerVisible, setCompatibilitiesDrawerVisible ] = useState(false)
  const [ selectedApInfo, setSelectedApInfo ] = useState<CompatibilitySelectedApInfo>(DefaultSelectedApInfo)
  const [ tableData, setTableData ] = useState([] as (APExtended|APExtendedGrouped)[])
  const [ hasGroupBy, setHasGroupBy ] = useState(false)
  const [ showFeatureCompatibilitiy, setShowFeatureCompatibilitiy ] = useState(false)

  const secureBootFlag = useIsSplitOn(Features.WIFI_EDA_SECURE_BOOT_TOGGLE)
  const AFC_Featureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'
  const apUptimeFlag = useIsSplitOn(Features.AP_UPTIME_TOGGLE)
  const apMgmtVlanFlag = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)
  const apTxPowerFlag = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const [ getApCompatibilitiesVenue ] = useLazyGetApCompatibilitiesVenueQuery()
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()
  const { data: wifiCapabilities } = useWifiCapabilitiesQuery({ params: { tenantId: params.tenantId } })

  const apListTableQuery = usePollingTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      groupByFields: groupedFields,
      filters
    },
    search: {
      searchTargetFields: defaultApPayload.searchTargetFields
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'name', 'serialNumber', 'deviceGroupName', 'deviceGroupId',
      'deviceStatus', 'fwVersion'],
    pagination: { settingsId }
  })
  const tableQuery = props.tableQuery || apListTableQuery

  useEffect(() => {
    const fetchApCompatibilitiesAndSetData = async () => {
      const result:React.SetStateAction<(APExtended|APExtendedGrouped)[]> = []
      const apIdsToIncompatible:{ [key:string]: number } = {}
      if (tableQuery.data?.data) {
        let apCompatibilitiesResponse:ApCompatibilityResponse = { apCompatibilities: [] }
        let apCompatibilities:ApCompatibility[] = []
        let apIds:string[] = []
        if (enableApCompatibleCheck && showFeatureCompatibilitiy) {
          const aps = tableQuery.data as TableResult<APExtended|APExtendedGrouped, ApExtraParams>
          apIds = retriedApIds(aps, hasGroupBy)
          try {
            if (apIds.length > 0) {
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
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('fetchApCompatibilitiesAndSetData error:', e)
          }
          apCompatibilities = apCompatibilitiesResponse.apCompatibilities
        }

        if (apCompatibilities?.length > 0) {
          apIds.forEach((id:string) => {
            const apIncompatible = find(apCompatibilities, ap => id===ap.id)
            if (apIncompatible) {
              apIdsToIncompatible[id] = apIncompatible?.incompatibleFeatures?.length ?? apIncompatible?.incompatible ?? 0
            }
          })
          if (hasGroupBy) {
            tableQuery.data.data?.forEach(item => {
              const children = (item as unknown as { aps: APExtended[] }).aps?.map(ap => ({ ...ap, incompatible: apIdsToIncompatible[ap.serialNumber] }))
              result.push({ ...item, aps: children, children })
            })
          } else {
            tableQuery.data.data?.forEach(ap => (result.push({ ...ap, incompatible: apIdsToIncompatible[ap.serialNumber] })))
          }
          setTableData(result)
        } else {
          setTableData(tableQuery.data?.data)
        }
      }
    }
    if (tableQuery.data) {
      if (enableApCompatibleCheck && showFeatureCompatibilitiy) {
        fetchApCompatibilitiesAndSetData()
      } else {
        setTableData(tableQuery.data.data)
      }
    }
    const totalCount = tableQuery.data?.totalCount || 0
    setApsCount?.(totalCount)

  }, [tableQuery.data, showFeatureCompatibilitiy])

  const apAction = useApActions()
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
  }))
  const linkToEditAp = useTenantLink('/devices/wifi/')

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

    const columns: TableProps<APExtended|APExtendedGrouped>['columns'] = [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      render: (_, row : APExtended, __, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {searchable ? highlightFn(row.name || '--') : row.name}</TenantLink>
      )
    }, {
      key: 'deviceStatus',
      width: 200,
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      fixed: 'left',
      filterKey: 'deviceStatusSeverity',
      filterable: filterables ? statusFilterOptions : false,
      groupable: enableGroups ?
        filterables && getGroupableConfig()?.deviceStatusGroupableOptions : undefined,
      render: (_, { deviceStatus, powerSavingStatus }) =>
        <APStatus status={deviceStatus as ApDeviceStatusEnum} powerSavingStatus={powerSavingStatus as PowerSavingStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      searchable: searchable,
      sorter: true,
      groupable: enableGroups ?
        filterables && getGroupableConfig()?.modelGroupableOptions : undefined
    }, {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'IP',
      searchable: searchable,
      sorter: true
    }, {
      key: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
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
      sorter: true,
      render: (_: React.ReactNode, row : APExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    }]),
    ...(params.apGroupId ? [] : [{
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (_: React.ReactNode, row : APExtended) => {
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
      render: (_, { meshRole }) => transformMeshRole(meshRole as APMeshRole)
    }, {
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: (_, row: APExtended) => {
        return <TenantLink to={`/devices/wifi/${row.serialNumber}/details/clients`}>
          {transformDisplayNumber(row.clients)}
        </TenantLink>
      }
    },
    ...(params.apGroupId ? [] : [{
      key: 'deviceGroupName',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      filterKey: 'deviceGroupId',
      filterable: filterables ? filterables['deviceGroupId'] : false,
      sorter: true,
      groupable: enableGroups
        ? filterables && getGroupableConfig(params, apAction)?.deviceGroupNameGroupableOptions
        : undefined
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
          render: (_, row) =>
            transformDisplayText(row[key] as string)
        })
        return acc
      }, [] as TableProps<APExtended|APExtendedGrouped>['columns'])
    },
    ...(apUptimeFlag ? [
      {
        key: 'uptime',
        title: $t({ defaultMessage: 'Up Time' }),
        dataIndex: 'apStatusData.APSystem.uptime',
        sorter: true,
        render: (data: React.ReactNode, row: APExtended) => {
          const uptime = row.apStatusData?.APSystem?.uptime
          return (uptime ? formatter('longDurationFormat')(uptime * 1000) : null)
        }
      }] : []),
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      searchable: searchable,
      sorter: true
    }, {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      show: false,
      searchable: searchable,
      sorter: true
    }, {
      key: 'fwVersion',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'fwVersion',
      show: false,
      sorter: true
    }, {
      key: 'poePort',
      title: $t({ defaultMessage: 'PoE Port' }),
      dataIndex: 'poePort',
      show: false,
      sorter: false,
      render: (_, row : APExtended) => {
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
        key: 'secureBoot',
        title: $t({ defaultMessage: 'Secure Boot' }),
        dataIndex: 'secureBootEnabled',
        show: false,
        sorter: false,
        render: (data: React.ReactNode, row: APExtended) => {
          const secureBootEnabled = row.apStatusData?.APSystem?.secureBootEnabled || false

          return (secureBootEnabled ? <CheckMark /> : null)
        }
      }] : []),
    ...(apMgmtVlanFlag ? [
      {
        key: 'managementVlan',
        title: $t({ defaultMessage: 'Management VLAN' }),
        dataIndex: 'managementVlan',
        show: false,
        sorter: false,
        render: (data: React.ReactNode, row: APExtended) => {
          const mgmtVlanId = row.apStatusData?.APSystem?.managementVlan

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
      render: (data: React.ReactNode, row: APExtended) => {
        return AFCStatusRender(row.apStatusData?.afcInfo, row.apRadioDeploy)
      }
    },
    {
      key: 'afcPowerMode',
      title: $t({ defaultMessage: 'AFC Power State' }),
      dataIndex: ['apStatusData','afcInfo','powerMode'],
      show: false,
      sorter: false,
      width: 200,
      render: (data: React.ReactNode, row: APExtended) => {
        const status = AFCPowerStateRender(row.apStatusData?.afcInfo, row.apRadioDeploy, isAPOutdoor(row.model))
        return (
          <>
            {status.columnText}
            {/* eslint-disable-next-line*/}
            {(status.columnText !== '--' && status.columnText !== 'Standard power' && status.tooltipText) && <Tooltip.Info
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
      filterKey: 'fwVersion',
      width: 200,
      filterableWidth: 200,
      filterable: showFeatureCompatibilitiy && filterables ? filterables['featureIncompatible']: false,
      filterMultiple: false,
      show: false,
      sorter: false,
      render: (_: React.ReactNode, row: APExtended) => {
        const { incompatible, deviceStatus } = row || {}
        return (<ApCompatibilityFeature
          count={incompatible}
          deviceStatus={deviceStatus}
          onClick={() => {
            const { serialNumber, name='', model='', fwVersion='' } = row || {}
            setSelectedApInfo({ serialNumber, name, model, firmwareVersion: fwVersion })
            setCompatibilitiesDrawerVisible(true)
          }} />
        )
      }
    }] : []),
    ...(apTxPowerFlag ? [{
      key: 'actualTxPower',
      dataIndex: 'actualTxPower',
      show: false,
      sorter: false,
      title: $t({ defaultMessage: 'Tx Power' }),
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
      }, [] as TableProps<APExtended|APExtendedGrouped>['columns'])
    }] : [])
    ]
    return columns
  }, [$t, tableQuery.data?.extra, showFeatureCompatibilitiy])

  const isActionVisible = (
    selectedRows: APExtended[],
    { selectOne, deviceStatus }: { selectOne?: boolean, deviceStatus?: string[] }) => {
    let visible = true
    if (selectOne) {
      visible = selectedRows.length === 1
    }
    if (visible && deviceStatus && deviceStatus.length > 0) {
      visible = selectedRows.every(ap => deviceStatus.includes(ap.deviceStatus))
    }
    return visible
  }


  const rowActions: TableProps<APExtended>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE],
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      navigate(`${linkToEditAp.pathname}/${rows[0].serialNumber}/edit/general`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE],
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
    visible: (rows) => isActionVisible(rows, { selectOne: true, deviceStatus: [ ApDeviceStatusEnum.OPERATIONAL, ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED ] }),
    onClick: (rows) => {
      apAction.showDownloadApLog(rows[0].serialNumber, params.tenantId)
    }
  }]

  const [ isImportResultLoading, setIsImportResultLoading ] = useState(false)
  const [ importVisible, setImportVisible ] = useState(false)
  const [ importCsv ] = useImportApMutation()
  const [ importQuery ] = useLazyImportResultQuery()
  const [ importResult, setImportResult ] = useState<ImportErrorRes>({} as ImportErrorRes)
  const [ importErrors, setImportErrors ] = useState<FetchBaseQueryError>({} as FetchBaseQueryError)
  const { acx_account_vertical } = getJwtTokenPayload()
  const isHospitality = acx_account_vertical === AccountVertical.HOSPITALITY ? AccountVertical.HOSPITALITY.toLowerCase() + '_' : ''
  const importTemplateLink = `assets/templates/${isHospitality}aps_import_template_with_gps.csv`
  // eslint-disable-next-line max-len
  const { exportCsv, disabled } = useExportCsv<APExtended>(tableQuery as TableQuery<APExtended, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)

  useEffect(()=>{
    setIsImportResultLoading(false)
    if (importResult?.fileErrorsCount === 0) {
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
  const handleTableChange: TableProps<APExtended>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    const customSorter = Array.isArray(sorter)
      ? sorter[0] : sorter
    if ('IP'.includes(customSorter.field as string)) {
      customSorter.field = 'IP.keyword'
    }
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

  return (
    <Loader states={[tableQuery]}>
      <Table<APExtended|APExtendedGrouped>
        {...props}
        settingsId={settingsId}
        columns={columns}
        columnState={enableApCompatibleCheck?{ onChange: handleColumnStateChange } : {}}
        dataSource={tableData}
        getAllPagesData={tableQuery.getAllPagesData}
        rowKey='serialNumber'
        pagination={tableQuery.pagination}
        onChange={handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        actions={props.enableActions ? filterByAccess([{
          label: $t({ defaultMessage: 'Add AP' }),
          scopeKey: [WifiScopes.CREATE],
          onClick: () => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/wifi/add`
            }, { state: { venueId: params.venueId } })
          }
        }, {
          label: $t({ defaultMessage: 'Add AP Group' }),
          scopeKey: [WifiScopes.CREATE],
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
        importRequest={(formData) => {
          setIsImportResultLoading(true)
          importCsv({ params: {}, payload: formData,
            callback: async (res: CommonResult) => {
              const result = await importQuery(
                { payload: { requestId: res.requestId } }, true)
                .unwrap()
              setImportResult(result)
            } }).unwrap().catch(() => {
            setIsImportResultLoading(false)
          })
        }}
        onClose={() => setImportVisible(false)}/>
      {!isEdgeCompatibilityEnabled &&
        <ApCompatibilityDrawer
          visible={compatibilitiesDrawerVisible}
          type={params.venueId?ApCompatibilityType.VENUE:ApCompatibilityType.NETWORK}
          venueId={params.venueId}
          networkId={params.networkId}
          apIds={selectedApInfo?.serialNumber ? [selectedApInfo.serialNumber] : []}
          apName={selectedApInfo?.name}
          isMultiple
          onClose={() => setCompatibilitiesDrawerVisible(false)}
        />
      }
      {isEdgeCompatibilityEnabled && <EnhancedApCompatibilityDrawer
        visible={compatibilitiesDrawerVisible}
        isMultiple
        type={params.venueId?ApCompatibilityType.VENUE:ApCompatibilityType.NETWORK}
        venueId={params.venueId}
        networkId={params.networkId}
        apInfo={selectedApInfo}
        onClose={() => setCompatibilitiesDrawerVisible(false)}
      />}
    </Loader>
  )
})
