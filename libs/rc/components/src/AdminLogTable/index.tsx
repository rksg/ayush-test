import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button  }   from '@acx-ui/components'
import { AdminLog, RequestPayload, TableQuery } from '@acx-ui/rc/utils'
import { formatter }                            from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { adminLogTypeMapping, severityMapping } from './mapping'

interface AdminLogTableProps {
  tableQuery: TableQuery<AdminLog, RequestPayload<unknown>, unknown>
}

const AdminLogTable = ({ tableQuery }: AdminLogTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<AdminLog>()

  const columns: TableProps<AdminLog>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
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
        >{formatter('dateTimeFormatWithSeconds')(row.event_datetime)}</Button>
      }
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true,
      render: function (_, row) {
        const msg = severityMapping[row.severity as keyof typeof severityMapping]
        return $t(msg)
      }
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: function (_, row) {
        const type = row.entity_type.toUpperCase() as keyof typeof adminLogTypeMapping
        return $t(adminLogTypeMapping[type])
      }
    },
    {
      key: 'adminName',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'adminName',
      sorter: true
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: true,
      render: function (_, row) {
        return JSON.parse(row.message).message_template
      }
    }
  ]
  const getDrawerData = (data: AdminLog) => [
    {
      title: defineMessage({ defaultMessage: 'Time' }),
      value: formatter('dateTimeFormatWithSeconds')(data.event_datetime)
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
      value: (() => {
        const msg = adminLogTypeMapping[data.entity_type as keyof typeof adminLogTypeMapping]
        return $t(msg)
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: data.adminName
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: JSON.parse(data.message).message_template
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table
      rowKey='id'
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
    />
    {visible && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Log Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={getDrawerData(current!)}
    />}
  </Loader>
}

export { AdminLogTable }
