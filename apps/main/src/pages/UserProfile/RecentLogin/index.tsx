import { useIntl } from 'react-intl'

import { Loader, Table, TableProps  }    from '@acx-ui/components'
import { useAdminLogsQuery }             from '@acx-ui/rc/services'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { formatter }                     from '@acx-ui/utils'

export interface EventList {
  adminName: string;
  entity_id: string;
  entity_type: string;
  id: string;
  message: string;
  raw_event: string;
  severity: string;
  event_datetime: string;
}

export function RecentLogin () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useAdminLogsQuery,
    pagination: {
      pageSize: 5
    },
    defaultPayload: {
      url: CommonUrlsInfo.getEventList.url,
      fields: [
        'event_datetime',
        'severity',
        'entity_type',
        'entity_id',
        'message',
        'adminName'
      ],
      searchString: 'logged into',
      filters: {
        entity_type: ['ADMIN', 'NOTIFICATION']
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
        return formatter('dateTimeFormatWithSeconds')(row.event_datetime)
      }
    }
  ]

  // const eventListPayload = {
  //   searchString: '',
  //   fields: ['tenantName', 'tenantEmail'],
  //   filters: {
  //     status: ['DELEGATION_STATUS_INVITED'],
  //     delegationType: ['DELEGATION_TYPE_VAR'],
  //     isValid: [true]
  //   }
  // }

  const EventListTable = () => {
    // const tableQuery = useTableQuery({
    //   useQuery: useEventListQuery,
    //   defaultPayload: eventListPayload
    // })

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