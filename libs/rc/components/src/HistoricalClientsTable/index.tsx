import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { cssStr, Subtitle }                from '@acx-ui/components'
import { Table, TableProps, Loader }       from '@acx-ui/components'
import { useGetHistoricalClientListQuery } from '@acx-ui/rc/services'
import {
  Client,
  useTableQuery
}                                                            from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { formatter }  from '@acx-ui/utils'

function getCols (intl: ReturnType<typeof useIntl>) {
  const dateTimeFormatter = formatter('dateTimeFormat')
  const columns: TableProps<Client>['columns'] = [{
    key: 'hostname',
    title: intl.$t({ defaultMessage: 'Hostname' }),
    dataIndex: 'hostname',
    sorter: true,
    defaultSortOrder: 'ascend',
    render: (data, row) =>
      <TenantLink
        to={`/users/wifi/clients/${row.clientMac}/details/overview?clientStatus=historical`}
      >
        {data ? data : '--'}
      </TenantLink>
  }, {
    key: 'clientMac',
    title: intl.$t({ defaultMessage: 'MAC Address' }),
    dataIndex: 'clientMac',
    sorter: true
  }, {
    key: 'clientIP',
    title: intl.$t({ defaultMessage: 'Last IP Address' }),
    dataIndex: 'clientIP',
    sorter: true,
    render: (data) => data ? data : '--'
  }, {
    key: 'userName',
    title: intl.$t({ defaultMessage: 'Username' }),
    dataIndex: 'userName',
    sorter: true,
    render: (data) => data ? data : '--'
  }, {
    key: 'venueId',
    title: intl.$t({ defaultMessage: 'Last Venue' }),
    dataIndex: 'venueId',
    sorter: true,
    render: (data, row) => row?.isVenueExists && data
      ? <TenantLink to={`/venues/${data}/venue-details/overview`}>{row?.venueName}</TenantLink>
      : row?.venueName
  }, {
    key: 'serialNumber',
    title: intl.$t({ defaultMessage: 'Last AP' }),
    dataIndex: 'serialNumber',
    sorter: true,
    render: (data, row) => row?.isApExists && data
      ? <TenantLink to={`/aps/${data}/details/overview`}>{row?.apName}</TenantLink>
      : row?.apName
  }, {
    key: 'ssid',
    title: intl.$t({ defaultMessage: 'Last SSID' }),
    dataIndex: 'ssid',
    sorter: true,
    render: (data, row) => row?.networkId
      ? <TenantLink to={`/networks/${row?.networkId}/network-details/aps`}>{data}</TenantLink>
      : data
  }, {
    key: 'disconnectTime',
    title: intl.$t({ defaultMessage: 'Last Seen' }),
    dataIndex: 'disconnectTime',
    sorter: true,
    render: (data) => dateTimeFormatter((data as number) * 1000)
  }, {
    key: 'tags',
    title: intl.$t({ defaultMessage: 'Tags' }),
    dataIndex: 'tags',
    sorter: true
  }]
  return columns
}

const defaultPayload = {
  searchString: '',
  fields: ['clientMac', 'clientIP', 'userName', 'hostname', 'venueId',
    'serialNumber', 'ssid', 'disconnectTime', 'cog', 'ssid', 'venueName', 'apName',
    'event_datetime', 'eventId', 'networkId'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac', 'userName', 'hostname'],
  filters: {
    entity_type: ['CLIENT'],
    eventId: ['204', '205', '208', '218']
  }
}

export function HistoricalClientsTable
({ searchString, setHistoricalClientCount, id } :
  { searchString: string, setHistoricalClientCount: (historicalClientCount: number) => void,
    id: string
  }) {
  const { $t } = useIntl()

  defaultPayload.searchString = searchString

  const HistoricalClientsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetHistoricalClientListQuery,
      defaultPayload
    })

    if(tableQuery.data?.data){
      setHistoricalClientCount(tableQuery.data?.totalCount)
    }

    return (
      <div id={id}>
        <Loader states={[
          tableQuery
        ]}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Historical Clients' })}
          </Subtitle>
          <Table
            columns={getCols(useIntl())}
            dataSource={tableQuery.data?.data}
            pagination={false}
            onChange={tableQuery.handleTableChange}
            rowKey='clientMac'
          />
          {!!tableQuery.data?.data?.length && <Typography.Text style={{
            fontSize: '10px',
            color: cssStr('--acx-neutrals-60')
          }}>{
              $t({ defaultMessage: `* There are more historical clients than can be displayed. 
        If you don’t see the client you are looking for, 
        narrow the list by entering a more specific text in the search box.` })
            }</Typography.Text>}
        </Loader>
      </div>
    )
  }

  return (
    <HistoricalClientsTable />
  )
}