import { useState, useEffect } from 'react'

import { omit }                   from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button }        from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import { DownloadOutlined }                         from '@acx-ui/icons'
import { Event, TableQuery }                        from '@acx-ui/rc/utils'
import { RequestPayload }                           from '@acx-ui/types'
import { exportMessageMapping }                     from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { filtersFrom, getDescription, getDetail, getSource, valueFrom } from './helpers'
import {
  severityMapping,
  eventTypeMapping,
  productMapping,
  typeMapping
} from './mapping'
import { useExportCsv } from './useExportCsv'

export const defaultColumnState = {
  event_datetime: true,
  severity: true,
  entity_type: true,
  product: true,
  source: true,
  macAddress: false,
  message: true
}

interface EventTableProps {
  settingsId?: string
  tableQuery: TableQuery<Event, RequestPayload<unknown>, unknown>,
  searchables?: boolean | string[]
  filterables?: boolean | string[]
  eventTypeMap?: Partial<typeof eventTypeMapping>
  columnState?: TableProps<Event>['columnState']
  omitColumns?: string[]
}

export const EventTable = ({
  settingsId,
  tableQuery,
  searchables = true,
  filterables = true,
  eventTypeMap = eventTypeMapping,
  columnState,
  omitColumns
}: EventTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Event>()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isRogueEventsFilterEnabled = useIsSplitOn(Features.ROGUE_EVENTS_FILTER)
  const { exportCsv, disabled } = useExportCsv<Event>(tableQuery)

  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const excludeEventType = [
    ...(!isEdgeEnabled ? ['EDGE'] : []),
    ...(!isRogueEventsFilterEnabled ? ['SECURITY'] : [])
  ]

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
    {
      title: defineMessage({ defaultMessage: 'Detail' }),
      value: getDetail(data)
    }
  ]

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
      iconButton={{
        icon: <DownloadOutlined />,
        disabled,
        tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
        onClick: exportCsv
      }}
    />
    {current && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Event Details' })}
      visible={visible}
      onClose={() => setVisible(false)}
      data={getDrawerData(current!)}
    />}
  </Loader>
}
