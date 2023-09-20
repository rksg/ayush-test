import { useEffect } from 'react'

import { Typography } from 'antd'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { cssStr, Subtitle, Table, TableProps, Loader } from '@acx-ui/components'
import { formatter, DateFormatEnum }                   from '@acx-ui/formatter'
import { useGetHistoricalClientListQuery }             from '@acx-ui/rc/services'
import {
  Client,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }                  from '@acx-ui/react-router-dom'
import { RequestPayload }                         from '@acx-ui/types'
import { encodeParameter, DateFilter, DateRange } from '@acx-ui/utils'

function getCols (intl: ReturnType<typeof useIntl>) {
  const dateTimeFormatter = formatter(DateFormatEnum.DateTimeFormat)
  const columns: TableProps<Client>['columns'] = [{
    key: 'hostname',
    title: intl.$t({ defaultMessage: 'Hostname' }),
    dataIndex: 'hostname',
    sorter: true,
    defaultSortOrder: 'ascend',
    fixed: 'left',
    render: (_, { hostname, disconnectTime, clientMac }) => {
      const period = encodeParameter<DateFilter>({
        startDate: moment((disconnectTime as number) * 1000).subtract(24, 'hours').format(),
        endDate: moment((disconnectTime as number) * 1000).format(),
        range: DateRange.custom
      })
      /* eslint-disable max-len */
      return <TenantLink
        to={`/users/wifi/clients/${clientMac}/details/overview?hostname=${hostname}&clientStatus=historical&period=${period}`}
      >
        {hostname ? hostname : '--'}
      </TenantLink>
      /* eslint-enable max-len */
    }
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
    render: (_, { clientIP }) => clientIP ? clientIP : '--'
  }, {
    key: 'userName',
    title: intl.$t({ defaultMessage: 'Username' }),
    dataIndex: 'userName',
    sorter: true,
    render: (_, { userName }) => userName ? userName : '--'
  }, {
    key: 'venueId',
    title: intl.$t({ defaultMessage: 'Last Venue' }),
    dataIndex: 'venueId',
    sorter: true,
    render: (_, row) => row?.isVenueExists && row?.venueId
      ? <TenantLink to={`/venues/${row?.venueId}/venue-details/overview`}>
        {row?.venueName}
      </TenantLink>
      : row?.venueName
  }, {
    key: 'serialNumber',
    title: intl.$t({ defaultMessage: 'Last AP' }),
    dataIndex: 'serialNumber',
    sorter: true,
    render: (_, row) => row?.isApExists && row?.serialNumber
      ? <TenantLink to={`/devices/wifi/${row?.serialNumber}/details/overview`}>
        {row?.apName}
      </TenantLink>
      : row?.apName
  }, {
    key: 'ssid',
    title: intl.$t({ defaultMessage: 'Last SSID' }),
    dataIndex: 'ssid',
    sorter: true,
    render: (_, row) => row?.networkId
      ? <TenantLink to={`/networks/wireless/${row?.networkId}/network-details/overview`}>
        {row?.ssid}
      </TenantLink>
      : row?.ssid
  }, {
    key: 'disconnectTime',
    title: intl.$t({ defaultMessage: 'Last Seen' }),
    dataIndex: 'disconnectTime',
    sorter: true,
    render: (_, { disconnectTime }) => dateTimeFormatter((disconnectTime as number) * 1000)
  // }, { // TODO: Waiting for TAG feature support
  //   key: 'tags',
  //   title: intl.$t({ defaultMessage: 'Tags' }),
  //   dataIndex: 'tags',
  //   sorter: true
  }]
  return columns
}

export const defaultHistoricalClientPayload = {
  searchString: '',
  fields: ['clientMac', 'clientIP', 'userName', 'hostname', 'venueId',
    'serialNumber', 'ssid', 'disconnectTime', 'cog', 'ssid', 'venueName', 'apName',
    'event_datetime', 'eventId', 'networkId'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac', 'userName', 'hostname', 'clientIP'],
  filters: {}
}

const defaultFilters = {
  entity_type: ['CLIENT'],
  eventId: ['204', '205', '208', '218']
}

export function HistoricalClientsTable
({ searchString, setHistoricalClientCount } :
  { searchString: string, setHistoricalClientCount: (historicalClientCount: number) => void
  }) {
  const { $t } = useIntl()
  const params = useParams()

  defaultHistoricalClientPayload.searchString = searchString
  defaultHistoricalClientPayload.filters =
    params.venueId ? { ...defaultFilters, venueId: [params.venueId] } :
      params.serialNumber ? { ...defaultFilters, serialNumber: [params.serialNumber] } :
        params.apId ? { ...defaultFilters, serialNumber: [params.apId] } :
          defaultFilters

  const HistoricalClientsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetHistoricalClientListQuery,
      defaultPayload: defaultHistoricalClientPayload
    })

    useEffect(() => {
      if (tableQuery.data?.data) {
        setHistoricalClientCount(tableQuery.data?.totalCount)
      }
    }, [tableQuery])

    return (
      <div>
        <Loader states={[
          tableQuery
        ]}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Historical Clients' })}
          </Subtitle>
          <Table
            settingsId='historical-clients-table'
            columns={getCols(useIntl())}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            stickyPagination={false}
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

export const GlobalSearchHistoricalClientsTable = (props: {
  tableQuery?: TableQuery<Client, RequestPayload<unknown>, unknown>
}) => {

  const tableQuery = props.tableQuery
  return (
    <Table
      settingsId='historical-clients-table'
      columns={getCols(useIntl())}
      dataSource={tableQuery?.data?.data}
      onChange={tableQuery?.handleTableChange}
      rowKey='clientMac'
    />
  )
}
