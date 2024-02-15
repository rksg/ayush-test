import { useState } from 'react'

import { useIntl } from 'react-intl'

import { useSwitchtListQuery, Switch }                     from '@acx-ui/analytics/services'
import { defaultSort, sortProp  }                          from '@acx-ui/analytics/utils'
import { Filter, Loader, Table, TableProps, useDateRange } from '@acx-ui/components'
import { formatter }                                       from '@acx-ui/formatter'
import { TenantLink }                                      from '@acx-ui/react-router-dom'

const pagination = { pageSize: 10, defaultPageSize: 10 }

export function SwitchList ({ searchVal = '' }: { searchVal?: string }) {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const [searchString, setSearchString] = useState(searchVal)

  const results = useSwitchtListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format(),
    limit: 100,
    query: searchString,
    metric: 'totalTraffic'
  })

  const updateSearchString = (_: Filter, search: { searchString?: string }) => {
    setSearchString(search.searchString!)
  }

  const switchesTablecolumnHeaders: TableProps<Switch>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: 'switchName',
      fixed: 'left',
      searchable: true,
      sorter: { compare: sortProp('switchName', defaultSort) },
      render: (_, row : Switch, __, highlightFn) => (
        <TenantLink to={`/devices/switch/${row.switchMac}/serial/details/incidents`}>
          {highlightFn(row.switchName)}</TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'switchMac',
      key: 'switchMac',
      searchable: true,
      sorter: { compare: sortProp('switchMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'switchModel',
      searchable: true,
      key: 'switchModel',
      sorter: { compare: sortProp('switchModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'switchVersion',
      key: 'switchVersion',
      searchable: true,
      sorter: { compare: sortProp('switchVersion', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Traffic (Total)' }),
      dataIndex: 'traffic',
      key: 'traffic',
      render: (_, { traffic }) => {
        return formatter('bytesFormat')(traffic)
      },
      sorter: { compare: sortProp('traffic', defaultSort) }
    }
  ]

  const data = results.data?.switches?.map((item: Switch, i) => ({
    ...item,
    rowId: i+1
  }))

  return <Loader states={[results]}>
    <Table<Switch>
      columns={switchesTablecolumnHeaders}
      dataSource={data as unknown as Switch[]}
      pagination={pagination}
      settingsId='switches-list-table'
      onFilterChange={updateSearchString}
      rowKey='rowId'
    />
  </Loader>
}
