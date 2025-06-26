import { useIntl } from 'react-intl'

import { Loader, Table, TableProps  }   from '@acx-ui/components'
import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import { useAdminLogsOnlyQuery }        from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { noDataDisplay, useTableQuery } from '@acx-ui/utils'

export type EventList = AdminLog

export function RecentLogin (props: { userEmail: string }) {
  const { $t } = useIntl()
  const { userEmail } = props

  const tableQuery = useTableQuery({
    useQuery: useAdminLogsOnlyQuery,
    pagination: {
      pageSize: 5
    },
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'entity_type',
        'id',
        'ipAddress'
      ],
      filters: {
        eventId: ['login-001'],
        userName: [`${userEmail}`]
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })

  const columnsRecentLogin: TableProps<EventList>['columns'] = [
    {
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      key: 'date',
      render: function (_, row) {
        return formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.event_datetime)
      }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: function (_, row) {
        return (row.ipAddress?? noDataDisplay)
      }
    }
  ]

  const EventListTable = () => {
    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columnsRecentLogin}
          dataSource={tableQuery.data?.data}
          style={{ width: '600px' }}
          rowKey='id'
          type={'form'}
        />
      </Loader>
    )
  }

  return (
    <EventListTable />
  )
}
