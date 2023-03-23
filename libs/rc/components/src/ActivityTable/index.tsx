import { useEffect, useState } from 'react'

import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { useActivitiesQuery }                from '@acx-ui/rc/services'
import {
  Activity,
  RequestPayload,
  TableQuery,
  getActivityDescription,
  productMapping,
  severityMapping,
  statusMapping,
  CommonUrlsInfo,
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  useTableQuery
} from '@acx-ui/rc/utils'
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

const useActivityTableFilter = () => {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).utc().format(),
    toTime: moment(endDate).utc().format()
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
  const { fromTime, toTime } = useActivityTableFilter()
  const filters = { ...baseFilters, fromTime, toTime }

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
    [fromTime, toTime]
  )

  return tableQuery
}

interface ActivityTableProps {
  tableQuery: TableQuery<Activity, RequestPayload<unknown>, unknown>
  filterables?: boolean | string[]
  columnState?: TableProps<Activity>['columnState']
}

const ActivityTable = ({
  tableQuery, filterables = true, columnState
}: ActivityTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Activity>()
  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const columns: TableProps<Activity>['columns'] = [
    {
      key: 'startDatetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'startDatetime',
      defaultSortOrder: 'descend',
      sorter: true,
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
        && Object.entries(productMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: ['admin', 'name'],
      sorter: true
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true,
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
      rowKey='startDatetime'
      columns={columns}
      dataSource={tableQuery.data?.data ?? []}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      columnState={columnState}
    />
    {current && visible && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Activity Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={getDrawerData(current)}
      timeLine={current.steps}
    /> }
  </Loader>
}

export { ActivityTable }
