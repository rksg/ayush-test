import { useIntl } from 'react-intl'

import { Loader, Table, TableProps  }              from '@acx-ui/components'
import { DateFormatEnum, formatter }               from '@acx-ui/formatter'
import { useAdminLogsQuery }                       from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'

export type EventList = AdminLog

export function RecentLogin (props: { userEmail: string }) {
  const { $t } = useIntl()
  const { userEmail } = props

  const tableQuery = useTableQuery({
    useQuery: useAdminLogsQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'adminName',
        'id',
        'ipAddress'
      ],
      searchString: 'logged',
      filters: {
        entity_type: ['ADMIN', 'NOTIFICATION']
      }
    },
    sorter: {
      sortField: 'event_datetime',
      sortOrder: 'DESC'
    }
  })

  const tableData = getProfilesByType(tableQuery.data?.data as AdminLog[])

  function getProfilesByType (queryData: AdminLog[]) {
    return queryData?.filter(p =>
      p.message.includes('logged into') && p.message.includes(userEmail)).slice(0, 5)
  }

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
      key: 'ipAddress'
    }
  ]

  const EventListTable = () => {
    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columnsRecentLogin}
          dataSource={tableData}
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
