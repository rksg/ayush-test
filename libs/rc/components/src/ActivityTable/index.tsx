import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import {
  Activity,
  RequestPayload,
  TableQuery,
  getActivityDescription,
  productMapping,
  severityMapping,
  statusMapping
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

interface ActivityTableProps {
  tableQuery: TableQuery<Activity, RequestPayload<unknown>, unknown>
}

const ActivityTable = ({ tableQuery }: ActivityTableProps) => {
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
      filterable: Object.entries(statusMapping).map(([key, value])=>({ key, value: $t(value) }))
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (_, row) {
        const msg = productMapping[row.product as keyof typeof productMapping]
        return $t(msg)
      },
      filterable: Object.entries(productMapping).map(([key, value])=>({ key, value: $t(value) }))
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
      value: (() => {
        const msg = severityMapping[data.severity as keyof typeof severityMapping]
        return $t(msg)
      })()
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
      value: (() => getActivityDescription(data.descriptionTemplate, data.descriptionData))()
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
