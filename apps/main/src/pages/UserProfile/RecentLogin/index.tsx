import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

// import {
//   // Loader,
//   Table,
//   TableProps
// } from '@acx-ui/components'
// import {
//   useEventListQuery
// } from '@acx-ui/rc/services'
// import {
//   useTableQuery
// } from '@acx-ui/rc/utils'
import { Loader, Table, TableProps, Button  }      from '@acx-ui/components'
import { useAdminLogsQuery }                       from '@acx-ui/rc/services'
import { AdminLog, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { formatter }                               from '@acx-ui/utils'

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

  let dataS
  if(tableQuery.data && tableQuery.data?.totalCount > 5) {
    dataS = tableQuery.data?.data.slice(0, 5)
  }
  // tableQuery.data?.totalCount > 5 ? tableQuery.data?.data.slice(0, 5) 
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