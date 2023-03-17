/* eslint-disable max-len */
import React, { useState, useEffect, useCallback, useMemo } from 'react'

import { FetchBaseQueryError }                               from '@reduxjs/toolkit/dist/query'
import { Badge }                                             from 'antd'
import { SorterResult, TableCurrentDataSource, FilterValue } from 'antd/lib/table/interface'
import { useIntl }                                           from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  deviceStatusColors,
  ColumnType
} from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import {
  useApListQuery, useImportApMutation,useGroupByApListQuery
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
  RequestPayload,
  usePollingTableQuery,
  APExtendedGrouped
} from '@acx-ui/rc/utils'
import { getFilters }                                        from '@acx-ui/rc/utils'
import { SEARCH, FILTER }                                    from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                    from '@acx-ui/user'

import { seriesMappingAP }           from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer } from '../ImportFileDrawer'
import { useApActions }              from '../useApActions'

import {
  getGroupableConfig
} from './config'

import type {
  TablePaginationConfig
} from 'antd'

type DeviceGroupBy = 'deviceStatus' | 'model' | 'deviceGroupName' | null
type OnTableChange = (
  pagination: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter:
    | SorterResult<APExtended | APExtendedGrouped>
    | SorterResult<APExtended | APExtendedGrouped>[],
  extra: TableCurrentDataSource<APExtended | APExtendedGrouped>
) => void

export const defaultApPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'IP', 'apMac', 'tags', 'serialNumber'],
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'poePort', 'apStatusData.lanPortStatus.phyLink', 'apStatusData.lanPortStatus.port',
    'fwVersion'
  ]
}
const groupedFields = [
  'check-all',
  'name',
  'deviceStatus',
  'model',
  'meshRole',
  'IP',
  'apMac',
  'venueName',
  'switchName',
  'clients',
  'deviceGroupName',
  'apStatusData.APRadio.band',
  'tags',
  'serialNumber',
  'fwVersion',
  'cog',
  'venueId',
  'apStatusData.APRadio.radioId',
  'apStatusData.APRadio.channel'
]

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
    case APMeshRole.DISABLED:
      meshRole = ''
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


interface ApTableProps
  extends Omit<TableProps<APExtended>, 'columns'> {
  tableQuery?: TableQuery<APExtended, RequestPayload<unknown>, ApExtraParams>
  searchable?: boolean
  enableActions?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

export function ApTable (props: ApTableProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { searchable, filterables } = props
  const [groupBySelection, setGroupBySelection] = useState<DeviceGroupBy>(null)
  const [tableFilter, setTableFilter] = useState<FILTER>(filters)
  const [tableSearch, setTableSearch] = useState<SEARCH>({})
  const groupByTableQuery = usePollingTableQuery({
    useQuery: useGroupByApListQuery,
    defaultPayload: {
      fields: groupedFields,
      filters,
      searchTargetFields: defaultApPayload.searchTargetFields,
      search: {
        searchTargetFields: defaultApPayload.searchTargetFields
      }
    },
    option: { skip: Boolean(props.tableQuery) || !Boolean(groupBySelection) }
  })
  const apListTableQuery = usePollingTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      filters
    },
    search: {
      searchTargetFields: defaultApPayload.searchTargetFields
    },
    option: { skip: Boolean(props.tableQuery) || Boolean(groupBySelection) }
  })
  const inlineTableQuery = groupBySelection ? groupByTableQuery : apListTableQuery
  const tableQuery = props.tableQuery || inlineTableQuery

  const apAction = useApActions()
  const releaseTag = useIsSplitOn(Features.DEVICES)
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: <Badge color={color} text={name} />
  }))
  const tableData = tableQuery?.data?.data ?? []
  const linkToEditAp = useTenantLink('/devices/wifi/')

  const columns = useMemo(() => {
    const extraParams = tableQuery?.data?.extra ?? {
      channel24: true,
      channel50: false,
      channelL50: false,
      channelU50: false,
      channel60: false
    }

    return [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      disable: true,
      searchable: searchable,
      render: (data, row : APExtended, _, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row?.serialNumber}/details/overview`}>
          {searchable ? highlightFn(row.name || '--') : data}</TenantLink>
      )
    }, {
      key: 'deviceStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      disable: true,
      filterKey: 'deviceStatusSeverity',
      filterable: filterables ? statusFilterOptions : false,
      groupable: getGroupableConfig()?.deviceStatusGroupableOptions,
      render: (status: unknown) => <APStatus status={status as ApDeviceStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      searchable: searchable,
      sorter: true,
      groupable: getGroupableConfig()?.modelGroupableOptions
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
    {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      filterKey: 'venueId',
      filterable: filterables ? filterables['venueId'] : false,
      sorter: true,
      render: (data, row : APExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }, {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (data, row : APExtended) => {
        return (
          <TenantLink to={`/switches/${row.venueId}/details/overview`}>{data}</TenantLink>
        )
      }
    }, {
      key: 'meshRole',
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: transformMeshRole
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
      groupable: getGroupableConfig()?.deviceGroupNameGroupableOptions
    }, {
      key: 'rf-channels',
      title: $t({ defaultMessage: 'RF Channels' }),
      children: Object.entries(extraParams)
        .map(([channel, visible]) => visible ? {
          key: channel,
          dataIndex: channel,
          title: <Table.SubTitle children={channelTitleMap[channel as keyof ApExtraParams]} />,
          align: 'center',
          ellipsis: true,
          render: (data: never, row: { [x: string]: string | undefined }) => transformDisplayText(row[channel])
        } : null)
        .filter(Boolean)
    }, {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      searchable: searchable,
      sorter: true
      //TODO: Click-> Filter by Tag
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
        if (!row?.hasPoeStatus) {
          return <span></span>
        }

        const iconColor = (row?.isPoEStatusUp) ? '--acx-semantics-green-50' : '--acx-neutrals-50'
        return (
          <span>
            <Badge color={`var(${iconColor})`}
              text={transformDisplayText(row?.poePortInfo)}
            />
          </span>
        )
      }
    }] as TableProps<APExtended | APExtendedGrouped>['columns']
  }, [$t, tableQuery?.data?.extra, filterables,releaseTag, searchable,statusFilterOptions])

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
      navigate(`${linkToEditAp.pathname}/${rows[0].serialNumber}/edit/details`, { replace: false })
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
      apAction.showRebootAp(rows[0].serialNumber, params.tenantId, clearSelection)
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows) => {
      apAction.showDownloadApLog(rows[0].serialNumber, params.tenantId)
    }
  }]
  const [ importVisible, setImportVisible ] = useState(false)
  const [ importCsv, importResult ] = useImportApMutation()
  const apGpsFlag = useIsSplitOn(Features.AP_GPS)
  const importTemplateLink = apGpsFlag ?
    'assets/templates/aps_import_template_with_gps.csv' :
    'assets/templates/aps_import_template.csv'

  useEffect(()=>{
    if (importResult.isSuccess) {
      setImportVisible(false)
    }
  },[importResult])
  useEffect(()=> {
    tableQuery?.handleFilterChange(tableFilter, tableSearch, groupBySelection)
  },[groupBySelection,tableFilter,tableSearch, tableQuery])

  const basePath = useTenantLink('/devices')
  return (
    <Loader states={[tableQuery]}>
      <Table<APExtended | APExtendedGrouped>
        {...props}
        columns={columns}
        dataSource={tableData}
        rowKey='serialNumber'
        pagination={tableQuery?.pagination}
        onChange={tableQuery?.handleTableChange as OnTableChange}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        onFilterChange={useCallback((filter : FILTER, search : SEARCH, groupBy?: string ) => {
          setTableFilter(filter)
          setTableSearch(search)
          setGroupBySelection?.(groupBy as DeviceGroupBy)
        },[setGroupBySelection,setTableFilter, setTableSearch])}
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
          label: $t({ defaultMessage: 'Import from file' }),
          onClick: () => {
            setImportVisible(true)
          }
        }]) : []}
      />
      <ImportFileDrawer type='AP'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData) => {
          importCsv({ params, payload: formData })
        }}
        onClose={() => setImportVisible(false)}/>
    </Loader>
  )
}
