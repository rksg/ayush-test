import React, { useState, useEffect, useMemo, useContext, useImperativeHandle, forwardRef, Ref } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { Badge }               from 'antd'
import { useIntl }             from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  deviceStatusColors,
  ColumnType,
  showToast
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useApListQuery, useImportApOldMutation, useImportApMutation, useLazyImportResultQuery
} from '@acx-ui/rc/services'
import {
  ApDeviceStatusEnum,
  APExtended,
  ApExtraParams,
  APMeshRole,
  APView,
  DeviceConnectionStatus,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  TableQuery,
  usePollingTableQuery,
  APExtendedGrouped
} from '@acx-ui/rc/utils'
import { getFilters, CommonResult, ImportErrorRes, FILTER }  from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }                                    from '@acx-ui/types'
import { filterByAccess }                                    from '@acx-ui/user'

import { seriesMappingAP }                                 from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../ImportFileDrawer'
import { useApActions }                                    from '../useApActions'

import {
  getGroupableConfig, groupedFields
} from './config'
import { ApsTabContext } from './context'
import { useExportCsv }  from './useExportCsv'

export const defaultApPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'IP', 'apMac', 'tags', 'serialNumber'],
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'poePort', 'apStatusData.lanPortStatus.phyLink', 'apStatusData.lanPortStatus.port',
    'fwVersion', 'apStatusData.APSystem.secureBootEnabled'
  ]
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

const channelTitleMap: Record<keyof ApExtraParams, string> = {
  channel24: '2.4 GHz',
  channel50: '5 GHz',
  channelL50: 'LO 5 GHz',
  channelU50: 'HI 5 GHz',
  channel60: '6 GHz'
}
const transformMeshRole = (value: APMeshRole) => {
  let meshRole = ''
  switch (value) {
    case APMeshRole.EMAP:
      meshRole = 'eMAP'
      break
    default:
      meshRole = value
      break
  }
  return transformDisplayText(meshRole)
}

export const APStatus = (
  { status, showText = true }: { status: ApDeviceStatusEnum, showText?: boolean }
) => {
  const intl = useIntl()
  const apStatus = transformApStatus(intl, status, APView.AP_LIST)
  return (
    <span>
      <Badge color={handleStatusColor(apStatus.deviceStatus)}
        text={showText ? apStatus.message : ''}
      />
    </span>
  )
}

export type ApTableRefType = { openImportDrawer: ()=>void }

interface ApTableProps
  extends Omit<TableProps<APExtended>, 'columns'> {
  tableQuery?: TableQuery<APExtended, RequestPayload<unknown>, ApExtraParams>
  searchable?: boolean
  enableActions?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const ApTable = forwardRef((props : ApTableProps, ref?: Ref<ApTableRefType>) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { searchable, filterables } = props
  const { setApsCount } = useContext(ApsTabContext)
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
      'deviceStatus', 'fwVersion']
  })
  const tableQuery = props.tableQuery || apListTableQuery
  const secureBootFlag = useIsSplitOn(Features.WIFI_EDA_SECURE_BOOT_TOGGLE)

  useEffect(() => {
    setApsCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const apAction = useApActions()
  const releaseTag = useIsSplitOn(Features.DEVICES)
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
  }))
  const tableData = tableQuery?.data?.data ?? []
  const linkToEditAp = useTenantLink('/devices/wifi/')

  const columns = useMemo(() => {
    const extraParams = tableQuery?.data?.extra ?? {
      channel24: false,
      channel50: false,
      channelL50: false,
      channelU50: false,
      channel60: false
    }

    const columns: TableProps<APExtended | APExtendedGrouped>['columns'] = [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      render: (data, row : APExtended, _, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {searchable ? highlightFn(row.name || '--') : data}</TenantLink>
      )
    }, {
      key: 'deviceStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      fixed: 'left',
      filterKey: 'deviceStatusSeverity',
      filterable: filterables ? statusFilterOptions : false,
      groupable: filterables && getGroupableConfig()?.deviceStatusGroupableOptions,
      render: (status: unknown) => <APStatus status={status as ApDeviceStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      searchable: searchable,
      sorter: true,
      groupable: filterables && getGroupableConfig()?.modelGroupableOptions
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
    ...(params.venueId ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      filterKey: 'venueId',
      filterable: filterables ? filterables['venueId'] : false,
      sorter: true,
      render: (data: React.ReactNode, row : APExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }]), {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (data, row : APExtended) => {
        return (
          // eslint-disable-next-line max-len
          <TenantLink to={`/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`}>{data}</TenantLink>
        )
      }
    }, {
      key: 'meshRole',
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: (data) => transformMeshRole(data as APMeshRole)
    }, {
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: (data, row : APExtended) => {
        return releaseTag ?
          <TenantLink to={`/devices/wifi/${row.serialNumber}/details/clients`}>
            {transformDisplayNumber(row.clients)}
          </TenantLink>
          : <>{transformDisplayNumber(row.clients)}</>
      }
    }, {
      key: 'deviceGroupName',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      filterKey: 'deviceGroupId',
      filterable: filterables ? filterables['deviceGroupId'] : false,
      sorter: true,
      groupable: filterables &&
        getGroupableConfig(params, apAction)?.deviceGroupNameGroupableOptions
    }, {
      key: 'rf-channels',
      dataIndex: 'rf-channels',
      title: $t({ defaultMessage: 'RF Channels' }),
      children: Object.entries(extraParams).reduce((acc, [channel, visible]) => {
        if (!visible) return acc
        const key = channel as keyof ApExtraParams
        acc.push({
          key: channel,
          dataIndex: channel,
          title: <Table.SubTitle children={channelTitleMap[key]} />,
          align: 'center',
          ellipsis: true,
          render: (data, row) =>
            transformDisplayText(row[key] as string)
        })
        return acc
      }, [] as TableProps<APExtended | APExtendedGrouped>['columns'])
    }, {
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
      render: (data, row : APExtended) => {
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
    ...(secureBootFlag? [
      {
        key: 'secureBoot',
        title: $t({ defaultMessage: 'Secure Boot' }),
        dataIndex: 'secureBootEnabled',
        show: false,
        sorter: false
      }] : [] )
    ]

    return columns
  }, [$t, tableQuery.data?.extra])

  const isActionVisible = (
    selectedRows: APExtended[],
    { selectOne, isOperational }: { selectOne?: boolean, isOperational?: boolean }) => {
    let visible = true
    if (isOperational) {
      visible = selectedRows.every(ap => ap.deviceStatus === ApDeviceStatusEnum.OPERATIONAL)
    }
    if (selectOne) {
      visible = visible && selectedRows.length === 1
    }
    return visible
  }


  const rowActions: TableProps<APExtended>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      navigate(`${linkToEditAp.pathname}/${rows[0].serialNumber}/edit/general`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
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
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
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
      apAction.showRebootAp(rows[0].serialNumber, params.tenantId, callback)
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows) => {
      apAction.showDownloadApLog(rows[0].serialNumber, params.tenantId)
    }
  }]
  const [ isImportResultLoading, setIsImportResultLoading ] = useState(false)
  const [ importVisible, setImportVisible ] = useState(false)
  const [ importAps, importApsResult ] = useImportApOldMutation()
  const [ importCsv ] = useImportApMutation()
  const [ importQuery ] = useLazyImportResultQuery()
  const [ importResult, setImportResult ] = useState<ImportErrorRes>({} as ImportErrorRes)
  const [ importErrors, setImportErrors ] = useState<ImportErrorRes>({} as ImportErrorRes)
  const apGpsFlag = useIsSplitOn(Features.AP_GPS)
  const wifiEdaFlag = useIsSplitOn(Features.WIFI_EDA_READY_TOGGLE)
  const importTemplateLink = apGpsFlag ?
    'assets/templates/aps_import_template_with_gps.csv' :
    'assets/templates/aps_import_template.csv'
  // eslint-disable-next-line max-len
  const { exportCsv, disabled } = useExportCsv<APExtended>(tableQuery as TableQuery<APExtended, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)

  useEffect(()=>{
    if (wifiEdaFlag) {
      return
    }

    setIsImportResultLoading(false)
    if (importApsResult.isSuccess) {
      setImportVisible(false)
    } else if (importApsResult.isError && importApsResult?.error &&
      'data' in importApsResult.error) {
      setImportResult(importApsResult?.error.data as ImportErrorRes)
    }
  },[importApsResult])

  useEffect(()=>{
    if (!wifiEdaFlag) {
      return
    }

    setIsImportResultLoading(false)
    if (importResult?.fileErrorsCount === 0) {
      setImportVisible(false)
    } else {
      setImportErrors(importResult)
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
  return (
    <Loader states={[tableQuery]}>
      <Table<APExtended | APExtendedGrouped>
        {...props}
        settingsId='ap-table'
        columns={columns}
        dataSource={tableData}
        getAllPagesData={tableQuery.getAllPagesData}
        rowKey='serialNumber'
        pagination={tableQuery.pagination}
        onChange={handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        actions={props.enableActions ? filterByAccess([{
          label: $t({ defaultMessage: 'Add AP' }),
          onClick: () => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/wifi/add`
            })
          }
        }, {
          label: $t({ defaultMessage: 'Add AP Group' }),
          onClick: () => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/apgroups/add`
            })
          }
        }, {
          label: $t({ defaultMessage: 'Import APs' }),
          onClick: () => {
            setImportVisible(true)
          }
        }]) : []}
        searchableWidth={260}
        filterableWidth={150}
        // eslint-disable-next-line max-len
        iconButton={exportDevice ? { icon: <DownloadOutlined />, disabled, onClick: exportCsv } : undefined}
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
        importError={{ data: importErrors } as FetchBaseQueryError}
        importRequest={(formData) => {
          setIsImportResultLoading(true)
          if (wifiEdaFlag) {
            importCsv({ params: {}, payload: formData,
              callback: async (res: CommonResult) => {
                const result = await importQuery(
                  { payload: { requestId: res.requestId } }, true)
                  .unwrap()
                setImportResult(result)
              } }).unwrap().catch(() => {
              setIsImportResultLoading(false)
            })
          } else {
            importAps({ params: {}, payload: formData })
          }
        }}
        onClose={() => setImportVisible(false)}/>
    </Loader>
  )
})
