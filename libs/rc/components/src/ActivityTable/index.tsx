import { useState } from 'react'

import moment                     from 'moment'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import {
  Activity,
  RequestPayload,
  TableQuery,
  getActivityDescription,
  productMapping,
  severityMapping,
  statusMapping,
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { formatter, useDateFilter } from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

export const defaultSorter = {
  sortField: 'startDatetime',
  sortOrder: 'DESC'
}

export const columnState = {
  defaultValue: {
    startDateTime: true,
    product: false,
    status: true,
    source: true,
    description: true
  }
}

export const useActivityTableFilter = () => {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).utc().format(),
    toTime: moment(endDate).utc().format()
  }
}

export const defaultPayload = {
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
  const [current, setCurrent] = useState<string>()

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
            setCurrent(row.requestId)
          }}
        >{formatter('dateTimeFormatWithSeconds')(row.startDatetime)}</Button>
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
        const msg = productMapping[row.product as keyof typeof productMapping]
        return $t(msg)
      },
      filterable: (Array.isArray(filterables) ? filterables.includes('product') : filterables)
        && Object.entries(productMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: ['admin', 'name']
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
      value: formatter('dateTimeFormatWithSeconds')(data.startDatetime)
    },
    {
      title: defineMessage({ defaultMessage: 'End Time' }),
      value: formatter('dateTimeFormatWithSeconds')(data.endDatetime)
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
      title: defineMessage({ defaultMessage: 'Admin IP' }),
      value: data.admin.ip
    },
    {
      title: defineMessage({ defaultMessage: 'Admin Interface' }),
      value: data.admin.interface
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
      dataSource={tableQuery.data?.data}
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
      data={getDrawerData(tableQuery.data?.data
        .find(row => current && row.requestId === current)!)}
      timeLine={tableQuery.data?.data
        .find(row => current && row.requestId === current)?.steps}
    /> }
  </Loader>
}

export { ActivityTable }
