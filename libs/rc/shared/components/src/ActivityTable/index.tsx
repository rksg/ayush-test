import { useEffect, useState } from 'react'
import React                   from 'react'

import { omit }                   from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import { Features, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { useActivitiesQuery }                from '@acx-ui/rc/services'
import {
  Activity,
  TableQuery,
  getActivityDescription,
  productMapping,
  severityMapping,
  statusMapping,
  CommonUrlsInfo,
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload }               from '@acx-ui/types'
import { useDateFilter, noDataDisplay } from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

export const columnState = {
  defaultValue: {
    startDateTime: true,
    status: true,
    product: false,
    name: true,
    description: true
  }
}

const defaultSorter = {
  sortField: 'startDatetime',
  sortOrder: 'DESC'
}

const defaultPayload = {
  url: CommonUrlsInfo.getActivityList.url,
  fields: [
    'startDatetime',
    'endDatetime',
    'status',
    'product',
    'admin',
    'descriptionTemplate',
    'descriptionData',
    'severity'
  ]
}

export function useActivityTableQuery (baseFilters: Record<string, string> = {}) {
  const { dateFilter } = useDateFilter()
  const filters = { ...baseFilters, dateFilter }

  const tableQuery = useTableQuery<Activity>({
    useQuery: useActivitiesQuery,
    defaultPayload: { ...defaultPayload, filters },
    sorter: defaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })

  useEffect(
    () => tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { ...(tableQuery.payload.filters as object), ...filters }
    }),
    [dateFilter]
  )

  return tableQuery
}

interface ActivityTableProps {
  settingsId?: string
  tableQuery: TableQuery<Activity, RequestPayload<unknown>, unknown>
  filterables?: boolean | string[]
  columnState?: TableProps<Activity>['columnState']
}

const ActivityTable = ({
  settingsId,
  tableQuery,
  filterables = true,
  columnState
}: ActivityTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Activity>()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const excludeProduct = [
    ...(!isEdgeEnabled ? ['EDGE'] : [])
  ]

  const columns: TableProps<Activity>['columns'] = [
    {
      key: 'startDatetime',
      width: 135,
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'startDatetime',
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
        >{formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.startDatetime)}</Button>
      }
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      render: function (_, row) {
        const msg = statusMapping[row.status as keyof typeof statusMapping]
        return $t(msg)
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('status') : filterables)
        && Object.entries(statusMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (_: React.ReactNode, row: { product: string }) {
        const key = row.product as keyof typeof productMapping
        const msg = productMapping[key] ? $t(productMapping[key]) : noDataDisplay
        return msg
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('product') : filterables)
        && Object.entries(omit(productMapping, excludeProduct))
          .map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'name',
      width: 220,
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: ['admin', 'name'],
      sorter: true
    },
    {
      key: 'description',
      width: Infinity,
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      render: function (_, row) {
        return getActivityDescription(row.descriptionTemplate, row.descriptionData)
      }
    }
  ]

  const getDrawerData = (data: Activity) => [
    {
      title: defineMessage({ defaultMessage: 'Start Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.startDatetime)
    },
    {
      title: defineMessage({ defaultMessage: 'End Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.endDatetime)
    },
    {
      title: defineMessage({ defaultMessage: 'Severity' }),
      value: $t(severityMapping[data.severity as keyof typeof severityMapping])
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: 'Admin activity'
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: data.admin.name
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getActivityDescription(data.descriptionTemplate, data.descriptionData)
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table
      settingsId={settingsId}
      rowKey='requestId'
      columns={columns}
      dataSource={tableQuery.data?.data ?? []}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      columnState={columnState}
    />
    {current && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Activity Details' })}
      visible={visible}
      onClose={() => setVisible(false)}
      data={getDrawerData(current)}
      width={464}
      activity={current}
    /> }
  </Loader>
}

export { ActivityTable }
