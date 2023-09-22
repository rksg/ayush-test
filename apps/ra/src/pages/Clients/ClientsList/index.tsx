import { useState } from 'react'

import { useIntl } from 'react-intl'

import { defaultSort, sortProp  }            from '@acx-ui/analytics/utils'
import { Filter, Loader, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { TenantLink }                        from '@acx-ui/react-router-dom'
import { defaultRanges }                     from '@acx-ui/utils'

import { useDateRange } from '../TimeRangeDropdown'

import { useClientListQuery, Client } from './services'


const pagination = { pageSize: 10, defaultPageSize: 10 }

export function ClientsList ({ searchVal='' }: { searchVal?: string }) {
  const { $t } = useIntl()
  const { timeRangeDropDownRange } = useDateRange()
  const timeRanges = defaultRanges()[timeRangeDropDownRange]!

  const [searchString, setSearchString] = useState(searchVal)
  const results = useClientListQuery({
    start: timeRanges[0].format(),
    end: timeRanges[1].format(),
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
      render: (_, row : Client, __, highlightFn) => (
        <TenantLink to={`/users/wifi/clients/${row.mac}/details`}>
          {highlightFn(row.hostname)}</TenantLink>
      )
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
      render: (value: unknown) => {
        return formatter(DateFormatEnum.DateTimeFormat)(value)
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
