import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { defaultSort, sortProp  }                          from '@acx-ui/analytics/utils'
import { Filter, Loader, Table, TableProps, useDateRange } from '@acx-ui/components'
import { DateFormatEnum, formatter }                       from '@acx-ui/formatter'
import { TenantLink }                                      from '@acx-ui/react-router-dom'
import { encodeParameter, DateFilter, DateRange }          from '@acx-ui/utils'

import { useClientListQuery, Client } from './services'


const pagination = { pageSize: 10, defaultPageSize: 10 }

export function ClientsList ({ searchVal='' }: { searchVal?: string }) {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const [searchString, setSearchString] = useState(searchVal)
  const results = useClientListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format(),
    limit: 100,
    query: searchString
  })

  const onSearch = (
    _: Filter,
    search: { searchString?: string }
  ) => {
    setSearchString(search.searchString!)
  }

  const clientTablecolumnHeaders: TableProps<Client>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      key: 'hostname',
      fixed: 'left',
      searchable: true,
      sorter: { compare: sortProp('hostname', defaultSort) },
      render: (_, row : Client, __, highlightFn) => {
        const { lastActiveTime, mac, hostname } = row
        const period = encodeParameter<DateFilter>({
          startDate: moment(lastActiveTime).subtract(24, 'hours').format(),
          endDate: lastActiveTime,
          range: DateRange.custom
        })
        return <TenantLink
          to={`/users/wifi/clients/${mac}/details/troubleshooting?period=${period}`}
        >
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
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      searchable: true,
      sorter: { compare: sortProp('ipAddress', defaultSort) }
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
      sorter: { compare: sortProp('osType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Last Connection' }),
      dataIndex: 'lastActiveTime',
      key: 'lastActiveTime',
      render: (_, { lastActiveTime }) => {
        return formatter(DateFormatEnum.DateTimeFormat)(lastActiveTime)
      },
      sorter: { compare: sortProp('lastActiveTime', defaultSort) }
    }
  ]
  return <Loader states={[results]}>
    <Table<Client>
      columns={clientTablecolumnHeaders}
      dataSource={results.data?.clients as unknown as Client[]}
      pagination={pagination}
      settingsId='clients-list-table'
      onFilterChange={onSearch}
    />
  </Loader>
}
