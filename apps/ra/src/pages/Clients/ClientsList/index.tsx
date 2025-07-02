import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { useNetworkClientListQuery, ClientByTraffic } from '@acx-ui/analytics/services'
import {
  defaultSort,
  sortProp,
  QueryParamsForZone,
  dateSort
} from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, useDateRange }               from '@acx-ui/components'
import { DateFormatEnum, formatter }                             from '@acx-ui/formatter'
import { TenantLink }                                            from '@acx-ui/react-router-dom'
import type { Filter }                                           from '@acx-ui/types'
import { hasPermission }                                         from '@acx-ui/user'
import { encodeParameter, DateFilter, DateRange, useDateFilter } from '@acx-ui/utils'

const pagination = { pageSize: 10, defaultPageSize: 10 }

export function ClientsList ({ searchVal='', queryParmsForZone }:
{ searchVal?: string, queryParmsForZone?: QueryParamsForZone }) {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const { startDate, endDate } = useDateFilter()
  const [searchString, setSearchString] = useState(searchVal)
  const requestPayload = Boolean(queryParmsForZone)
    ? {
      start: startDate,
      end: endDate,
      limit: 100,
      query: searchString,
      filter: { networkNodes: queryParmsForZone?.path }
    }
    : {
      start: timeRange[0].format(),
      end: timeRange[1].format(),
      limit: 100,
      query: searchString,
      filter: {}
    }

  const results = useNetworkClientListQuery(requestPayload)

  const onSearch = (
    _: Filter,
    search: { searchString?: string }
  ) => {
    setSearchString(search.searchString!)
  }

  const clientTablecolumnHeaders: TableProps<ClientByTraffic>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      key: 'hostname',
      fixed: 'left',
      searchable: true,
      sorter: { compare: sortProp('hostname', defaultSort) },
      render: (_, row : ClientByTraffic, __, highlightFn) => {
        const { lastSeen, mac, hostname } = row
        const period = encodeParameter<DateFilter>({
          startDate: moment(lastSeen).subtract(8, 'hours').format(),
          endDate: moment(lastSeen).format(),
          range: DateRange.custom
        })
        const link = hasPermission({ permission: 'READ_CLIENT_TROUBLESHOOTING' })
          ? `/users/wifi/clients/${mac}/details/troubleshooting?period=${period}`
          : `/users/wifi/clients/${mac}/details/reports`
        return <TenantLink to={link}>
          {highlightFn(hostname)}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'username',
      key: 'username',
      searchable: true,
      sorter: { compare: sortProp('username', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      searchable: true,
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) },
      width: 100
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      searchable: true,
      sorter: { compare: sortProp('ipAddress', defaultSort) },
      width: 80
    },
    {
      title: $t({ defaultMessage: 'Manufacturer' }),
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      searchable: true,
      sorter: { compare: sortProp('manufacturer', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'OS Type' }),
      dataIndex: 'osType',
      key: 'osType',
      searchable: true,
      sorter: { compare: sortProp('osType', defaultSort) },
      width: 100
    },
    {
      title: $t({ defaultMessage: 'User Traffic (Total)' }),
      dataIndex: 'traffic',
      key: 'traffic',
      render: (_, { traffic }) => {
        return formatter('bytesFormat')(traffic)
      },
      sorter: { compare: sortProp('traffic', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Last Seen Time' }),
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (_, { lastSeen }) => {
        return formatter(DateFormatEnum.DateTimeFormat)(lastSeen)
      },
      sorter: { compare: sortProp('lastSeen', dateSort) },
      width: 120
    }
  ]
  return <Loader states={[results]}>
    <Table<ClientByTraffic>
      columns={clientTablecolumnHeaders}
      dataSource={results.data?.clientsByTraffic as unknown as ClientByTraffic[]}
      pagination={pagination}
      settingsId='clients-list-table'
      onFilterChange={onSearch}
      rowKey='mac'
    />
  </Loader>
}
