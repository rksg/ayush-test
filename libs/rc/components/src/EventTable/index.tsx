import { useState } from 'react'

import moment                     from 'moment'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button }                 from '@acx-ui/components'
import { CommonUrlsInfo, Event, RequestPayload, TableQuery } from '@acx-ui/rc/utils'
import { formatter, useDateFilter }                          from '@acx-ui/utils'

import { replaceStrings } from '../ActivityTable/replaceStrings'
import { TimelineDrawer } from '../TimelineDrawer'

import { severityMapping, eventTypeMapping, productMapping } from './mapping'

export const useEventTableFilter = () => {
  const { startDate, endDate } = useDateFilter()
  return {
    fromTime: moment(startDate).milliseconds(0).toISOString().replace('.000', ''),
    toTime: moment(endDate).milliseconds(0).toISOString().replace('.000', '')
  }
}

export const defaultPayload = {
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
}

export const defaultSorter = {
  sortField: 'event_datetime',
  sortOrder: 'DESC'
}

interface EventTableProps {
  tableQuery: TableQuery<Event, RequestPayload<unknown>, unknown>
}

export const EventTable = ({ tableQuery }: EventTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Event>()

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
    return replaceStrings(message, data)
  }
  const columns: TableProps<Event>['columns'] = [
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
        const msg = eventTypeMapping[
          row.entity_type as keyof typeof eventTypeMapping]
        return $t(msg)
      }
    },
    {
      key: 'product',
      title: $t({ defaultMessage: 'Product' }),
      dataIndex: 'product',
      sorter: true,
      render: function (_, row) {
        const msg = productMapping[row.product as keyof typeof productMapping]
        return $t(msg)
      }
    },
    {
      key: 'source',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'source',
      sorter: true,
      render: function (_, row) {
        return getSource(row)
      }
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: true,
      render: function (_, row) {
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
        const msg = severityMapping[data.severity as keyof typeof severityMapping]
        return $t(msg)
      })()
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: (() => {
        const msg = eventTypeMapping[
          data.entity_type as keyof typeof eventTypeMapping]
        return $t(msg)
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
      data={getDrawerData(current!)}
    />}
  </Loader>
}

