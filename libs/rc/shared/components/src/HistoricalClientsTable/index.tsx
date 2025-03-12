import { memo, useEffect, useState } from 'react'

import { Typography } from 'antd'
import moment         from 'moment-timezone'
import { useIntl }    from 'react-intl'

import {
  cssStr,
  Subtitle,
  RangePicker,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useIsSplitOn, Features }          from '@acx-ui/feature-toggle'
import { formatter, DateFormatEnum }       from '@acx-ui/formatter'
import { useGetHistoricalClientListQuery } from '@acx-ui/rc/services'
import {
  Client,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload }             from '@acx-ui/types'
import { getShowWithoutRbacCheckKey } from '@acx-ui/user'
import { encodeParameter,
  getDatePickerValues,
  getDateRangeFilter,
  DateFilter,
  DateRange
} from '@acx-ui/utils'

function GetCols (intl: ReturnType<typeof useIntl>) {
  const { networkId } = useParams()
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
        startDate: moment((disconnectTime as number) * 1000).subtract(8, 'hours').format(),
        endDate: moment((disconnectTime as number) * 1000).format(),
        range: DateRange.custom
      })
      /* eslint-disable max-len */
      return <TenantLink
        to={`/users/wifi/clients/${clientMac}/details/overview?clientStatus=historical&period=${period}`}
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
    title: intl.$t({ defaultMessage: 'Last <VenueSingular></VenueSingular>' }),
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
  },
  ...(networkId ? [] : [{
    key: 'ssid',
    title: intl.$t({ defaultMessage: 'Last SSID' }),
    dataIndex: 'ssid',
    sorter: true,
    render: (_: React.ReactNode, row: Client) => row?.networkId
      ? <TenantLink to={`/networks/wireless/${row?.networkId}/network-details/overview`}>
        {row?.ssid}
      </TenantLink>
      : row?.ssid
  }]), {
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

export const HistoricalClientsTable =
memo(({ searchString, setHistoricalClientCount } :
  { searchString: string, setHistoricalClientCount: (historicalClientCount: number) => void
  }) => {
  const { $t } = useIntl()
  const params = useParams()
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const showDatePicker = useIsSplitOn(Features.ACX_UI_HISTORICAL_CLIENTS_DATE_RANGE_LIMIT)

  const [dateFilter, setDateFilter] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last24Hours)
  )
  const { startDate, endDate, range } = getDatePickerValues(dateFilter)

  const filters = showDatePicker ? { ...defaultFilters, dateFilter } : defaultFilters

  defaultHistoricalClientPayload.searchString = searchString
  defaultHistoricalClientPayload.filters =
    params.venueId ? { ...filters, venueId: [params.venueId] } :
      params.serialNumber ? { ...filters, serialNumber: [params.serialNumber] } :
        params.apId ? { ...filters, serialNumber: [params.apId] } :
          params.networkId ? { ...filters, networkId: [params.networkId] } :
            filters

  const HistoricalClientsTable = () => {
    const settingsId = 'historical-clients-table'
    const tableQuery = useTableQuery({
      useQuery: useGetHistoricalClientListQuery,
      defaultPayload: defaultHistoricalClientPayload,
      pagination: { settingsId }
    })

    useEffect(
      () => tableQuery.setPayload({
        ...tableQuery.payload,
        filters: { ...(tableQuery.payload.filters as object), ...filters }
      }),
      [dateFilter]
    )

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
          { showDatePicker &&
            <div style={{ textAlign: 'right' }}>
              <RangePicker
                key={getShowWithoutRbacCheckKey('range-picker')}
                selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
                onDateApply={setDateFilter as CallableFunction}
                showTimePicker
                selectionType={range}
                allowedMonthRange={showResetMsg ? 3 : undefined}
                maxMonthRange={isDateRangeLimit ? 1 : 3}
              />
            </div>
          }
          <Table
            settingsId={settingsId}
            columns={GetCols(useIntl())}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            rowKey='clientMac'
            filterPersistence={enabledUXOptFeature}
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
})

export const GlobalSearchHistoricalClientsTable = (props: {
  tableQuery?: TableQuery<Client, RequestPayload<unknown>, unknown>
}) => {

  const tableQuery = props.tableQuery
  return (
    <Table
      settingsId='historical-clients-table'
      columns={GetCols(useIntl())}
      dataSource={tableQuery?.data?.data}
      onChange={tableQuery?.handleTableChange}
      rowKey='clientMac'
    />
  )
}
