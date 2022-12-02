import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps }               from '@acx-ui/components'
import { useAdminLogsQuery }                       from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { formatter }                               from '@acx-ui/utils'

import { adminLogEventTypeMapping, severityMapping } from './mapping'
import { TimelineDrawer }                            from './TimelineDrawer'

const AdminLogs = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<AdminLog>()

  const tableQuery = useTableQuery({
    useQuery: useAdminLogsQuery,
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'apMac',
        'clientMac',
        'apName',
        'switchName',
        'serialNumber',
        'networkName',
        'networkId',
        'ssid',
        'radio',
        'raw_event',
        'product',
        'sourceType',
        'adminName',
        'clientName',
        'userName',
        'hostname',
        'adminEmail',
        'administratorEmail',
        'venueName',
        'venueId',
        'apGroupId',
        'apGroupName',
        'floorPlanName',
        'recipientName',
        'transactionId'
      ],
      filters: {
        entity_type: ['ADMIN', 'NOTIFICATION']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })

  const columns: TableProps<AdminLog>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      defaultSortOrder: 'descend',
      sorter: true,
      render: function (data, row) {
        return <span onClick={()=>{
          setVisible(true)
          setCurrent(row)
        }}>{
            formatter('dateTimeFormatWithSeconds')(row.event_datetime)
          }</span>
      }
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true,
      render: function (data, row) {
        const msg = severityMapping[row.severity as keyof typeof severityMapping]
        return msg ? $t(msg) : row.severity
      }
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      render: function (data, row) {
        const msg = adminLogEventTypeMapping[
          row.entity_type as keyof typeof adminLogEventTypeMapping]
        return msg ? $t(msg) : row.entity_type
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
      render: function (data, row) {
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
        const severityMsg = severityMapping[data.severity as keyof typeof severityMapping]
        return severityMsg? $t(severityMsg) : data.severity
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: (() => {
        const eventTypeMsg = adminLogEventTypeMapping[
          data.entity_type as keyof typeof adminLogEventTypeMapping]
        return eventTypeMsg? $t(eventTypeMsg) : data.entity_type
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
      data={current ? getDrawerData(current) : []}
    />}
  </Loader>
}

export { AdminLogs }