import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps }            from '@acx-ui/components'
import { useEventsQuery }                       from '@acx-ui/rc/services'
import { Event, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { formatter }                            from '@acx-ui/utils'

import { severityMapping, eventEventTypeMapping, productMapping } from './mapping'
import { TimelineDrawer }                                         from './TimelineDrawer'

const Events = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Event>()

  const tableQuery = useTableQuery({
    useQuery: useEventsQuery,
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'product',
        'entity_id',
        'message',
        'dpName',
        'apMac',
        'clientMac',
        'macAddress',
        'apName',
        'switchName',
        'serialNumber',
        'networkName',
        'networkId',
        'ssid',
        'radio',
        'raw_event',
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
        'transactionId',
        'name'
      ],
      filters: {
        entity_type: ['AP', 'CLIENT', 'SWITCH', 'NETWORK']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })

  const getSource = (data: Event) => {
    const sourceMapping = {
      AP: 'apName',
      CLIENT: 'clientName'
    }
    const key = sourceMapping[data.entity_type as keyof typeof sourceMapping]
    return data[key as keyof Event] as string
  }

  const getDescription = (data: Event) => {
    let message = data.message && JSON.parse(data.message).message_template
    message && message.match(new RegExp(/@@\w+/, 'g'))?.forEach((match: string) => {
      message = message.replace(match, data[match.replace('@@','') as keyof Event])
    })
    return message
  }
  const columns: TableProps<Event>['columns'] = [
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
        const msg = eventEventTypeMapping[
          row.entity_type as keyof typeof eventEventTypeMapping]
        return msg ? $t(msg) : row.entity_type
      }
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (data, row) {
        const msg = productMapping[row.product as keyof typeof productMapping]
        return msg ? $t(msg) : row.product
      }
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      sorter: true,
      render: function (data, row) {
        return getSource(row)
      }
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: true,
      render: function (data, row) {
        return getDescription(row)
      }
    }
  ]
  const getDrawerData = (data: Event) => [
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
        const eventTypeMsg = eventEventTypeMapping[
          data.entity_type as keyof typeof eventEventTypeMapping]
        return eventTypeMsg? $t(eventTypeMsg) : data.entity_type
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: getSource(data)
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getDescription(data)
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
      title={defineMessage({ defaultMessage: 'Event Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={current ? getDrawerData(current) : []}
    />}
  </Loader>
}
export { Events }
