import { useState, useEffect } from 'react'

import {
  Loading3QuartersOutlined
} from '@ant-design/icons'
import { MenuProps }              from 'antd'
import { get, omit }              from 'lodash'
import moment                     from 'moment'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, Table, TableProps, Button, showToast, Filter }                                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                                                             from '@acx-ui/formatter'
import { DownloadOutlined }                                                                                                      from '@acx-ui/icons'
import { useAddExportSchedulesMutation }                                                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, Event, EventExportSchedule, EventScheduleFrequency, TableQuery }                                        from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                                        from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasCrossVenuesPermission, useUserProfileContext }                                 from '@acx-ui/user'
import { computeRangeFilter, DateRangeFilter, exportMessageMapping, getOpsApi, noDataDisplay, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'
import { useIsEdgeReady } from '../useEdgeActions'

import { filtersFrom, getDescription, getDetail, getSource, valueFrom } from './helpers'
import {
  severityMapping,
  eventTypeMapping,
  productMapping,
  typeMapping
} from './mapping'
import { ScheduleExportDrawer } from './ScheduleExportDrawer'
import { useExportCsv }         from './useExportCsv'

export const defaultColumnState = {
  event_datetime: true,
  severity: true,
  entity_type: true,
  product: true,
  source: true,
  macAddress: false,
  message: true
}

export type IconButtonProps = {
  key?: string
  icon: React.ReactNode
  disabled?: boolean
  tooltip?: string
  onClick?: () => void
  dropdownMenu?: Omit<MenuProps, 'placement'>
}

interface EventTableProps {
  settingsId?: string
  tableQuery: TableQuery<Event, RequestPayload<unknown>, unknown>,
  searchables?: boolean | string[]
  filterables?: boolean | string[]
  eventTypeMap?: Partial<typeof eventTypeMapping>
  columnState?: TableProps<Event>['columnState']
  omitColumns?: string[]
  showScheduleExport?: boolean
}

export const EventTable = ({
  settingsId,
  tableQuery,
  searchables = true,
  filterables = true,
  eventTypeMap = eventTypeMapping,
  columnState,
  omitColumns,
  showScheduleExport = false
}: EventTableProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [visible, setVisible] = useState(false)
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false)
  const [current, setCurrent] = useState<Event>()
  const isEdgeEnabled = useIsEdgeReady()
  const isRogueEventsFilterEnabled = useIsSplitOn(Features.ROGUE_EVENTS_FILTER)
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const { exportCsv, disabled } = useExportCsv<Event>(tableQuery)
  const [addExportSchedules] = useAddExportSchedulesMutation()
  const { rbacOpsApiEnabled } = getUserProfile()

  const isExportEventsEnabled = useIsSplitOn(Features.EXPORT_EVENTS_TOGGLE)
  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const { isCustomRole } = useUserProfileContext()

  const openEventScheduler = () => {
    setExportDrawerVisible(true)
  }

  const excludeEventType = [
    ...(!isEdgeEnabled ? ['EDGE'] : []),
    ...(!isRogueEventsFilterEnabled ? ['SECURITY'] : [])
  ]

  const supportedEventTypes =
    filtersFrom(omit(eventTypeMap, excludeEventType), filterables, 'entity_type')

  const allEventTypes = filtersFrom(typeMapping, true)

  const exportCsvImmediately = () => {
    const filters = get(tableQuery?.payload, 'filters', {}) as {
      dateFilter: DateRangeFilter, entity_type: string[] }
    const eventsPeriodForExport = computeRangeFilter(
      { dateFilter: filters.dateFilter },
      ['from', 'to']
    ) as { from: string, to: string }
    const payload: EventExportSchedule = {
      type: 'Event',
      clientTimeZone: moment.tz.guess(),
      reportSchedule: {
        type: EventScheduleFrequency.Immediate
      },
      period: eventsPeriodForExport,
      context: {
        searchString: [tableQuery.payload?.searchString || ''] as string[],
        event_entity_type_all: (supportedEventTypes && supportedEventTypes?.map(obj => obj['key']))
        // if no set of required entity_types available then pass all entity_types
        // this case is when we get Events table in global search result where we dont have event type filter
         || filters.entity_type || (allEventTypes && allEventTypes?.map(obj => obj['key'])),
        ...omit(tableQuery?.payload?.filters as Filter, ['dateFilter'])
      },
      isSupport: true, // direct export needs to set isSupport true
      sortField: tableQuery.sorter?.sortField,
      sortOrder: tableQuery.sorter?.sortOrder,
      tenantId: tenantId,
      enable: true,
      recipients: []
    }

    showToast({
      type: 'info',
      duration: 5,
      closable: false,
      extraContent: <div style={{ width: '60px' }}>
        <Loading3QuartersOutlined spin
          style={{ margin: 0, fontSize: '18px' }}/>
      </div>,
      content: $t(
        { defaultMessage: 'The event export is being generated. ' +
            'This is taking some time…' }
      )
    })

    addExportSchedules(payload)
  }

  const tableIconButtonConfig = isExportEventsEnabled ? {
    icon: <DownloadOutlined />,
    dropdownMenu: {
      items: [
        { key: 'exportNow',
          label: $t({ defaultMessage: 'Export Now' }),
          disabled: !((tableQuery.data?.data ?? []).length > 0),
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: exportCsvImmediately },
        (showScheduleExport ?
          { key: 'scheduleExport', label: $t({ defaultMessage: 'Schedule Export' }),
            onClick: openEventScheduler } : {})
      ]
    }
  } as IconButtonProps
    : {
      icon: <DownloadOutlined />,
      disabled,
      tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
      onClick: exportCsv
    }

  const excludeProduct = [
    ...(!isEdgeEnabled ? ['EDGE'] : [])
  ]

  const columns: TableProps<Event>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      defaultSortOrder: 'descend',
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return <Button
          type='link'
          size='small'
          onClick={()=>{
            setVisible(true)
            setCurrent(row)
          }}
        >{formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.event_datetime)}</Button>
      }
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true,
      render: (_, row) => valueFrom(severityMapping, row.severity),
      filterable: filtersFrom(severityMapping, filterables, 'severity')
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: (_, row) => valueFrom(typeMapping, row.entity_type),
      filterable: filtersFrom(omit(eventTypeMap, excludeEventType), filterables, 'entity_type')
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: (_, row) => valueFrom(productMapping, row.product),
      filterable: filtersFrom(omit(productMapping, excludeProduct), filterables, 'product')
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'entity_id',
      sorter: true,
      render: function (_, row, __, highlightFn) {
        const searchable = Array.isArray(searchables)
          ? searchables.includes('entity_type') : searchables
        return getSource(row, searchable ? highlightFn : v => v)
      },
      searchable: Array.isArray(searchables) ? searchables.includes('entity_type') : searchables
    },
    {
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      sorter: true
    },
    {
      key: 'message',
      width: Infinity,
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      render: function (_, row, __, highlightFn) {
        const searchable = Array.isArray(searchables)
          ? searchables.includes('message') : searchables
        return getDescription(row, searchable ? highlightFn : v => v)
      },
      searchable: Array.isArray(searchables) ? searchables.includes('message') : searchables
    }
  ]
  const getDrawerData = (data: Event) => [
    {
      title: defineMessage({ defaultMessage: 'Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.event_datetime)
    },
    {
      title: defineMessage({ defaultMessage: 'Severity' }),
      value: valueFrom(severityMapping, data.severity)
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: valueFrom(typeMapping, data.entity_type)
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: getSource(data)
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getDescription(data)
    },
    ...(getDetail(data) ? [{
      title: defineMessage({ defaultMessage: 'Detail' }),
      value: getDetail(data) || noDataDisplay
    }] : [])
  ]

  useTrackLoadTime({
    itemName: widgetsMapping.EVENT_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return <Loader states={[tableQuery]}>
    <Table
      settingsId={settingsId}
      rowKey='tableKey'
      columns={columns.filter(({ key })=>!(omitColumns && omitColumns.includes(key)))}
      columnState={columnState || { defaultValue: defaultColumnState }}
      dataSource={tableQuery.data?.data ?? []}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      iconButton={!isCustomRole && (rbacOpsApiEnabled ?
        hasAllowedOperations([
          getOpsApi(CommonUrlsInfo.getEventList),
          getOpsApi(CommonUrlsInfo.getEventListMeta),
          getOpsApi(CommonUrlsInfo.addExportSchedules),
          getOpsApi(CommonUrlsInfo.updateExportSchedules)
        ])
        : hasCrossVenuesPermission())
        ? tableIconButtonConfig : {} as IconButtonProps}
      filterPersistence={enabledUXOptFeature}
    />
    {current && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Event Details' })}
      visible={visible}
      onClose={() => setVisible(false)}
      data={getDrawerData(current!)}
    />}
    {showScheduleExport && isExportEventsEnabled && exportDrawerVisible
      && <ScheduleExportDrawer
        title={defineMessage({ defaultMessage: 'Schedule Event Export' })}
        visible={exportDrawerVisible}
        onClose={() => setExportDrawerVisible(false)}
        onSubmit={() => setExportDrawerVisible(false)}
      />
    }
  </Loader>
}
