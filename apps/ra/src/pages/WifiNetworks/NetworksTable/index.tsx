import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Network, useNetworkListQuery }                    from '@acx-ui/analytics/services'
import { defaultSort, sortProp }                           from '@acx-ui/analytics/utils'
import { Table, TableProps, useDateRange, Loader, Filter } from '@acx-ui/components'
import { formatter }                                       from '@acx-ui/formatter'
import { TenantLink }                                      from '@acx-ui/react-router-dom'

export function NetworkList ({ searchVal = '' }: { searchVal?: string }) {
  const { $t } = useIntl()

  const { timeRange } = useDateRange()
  const pagination = { pageSize: 10, defaultPageSize: 10 }
  const [searchString, setSearchString] = useState(searchVal)

  const results = useNetworkListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format(),
    limit: 100,
    metric: 'traffic',
    query: searchString
  })

  const updateSearchString = (_: Filter, search: { searchString?: string }) => {
    setSearchString(search.searchString!)
  }

  const networkTableColumnHeaders: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      width: 130,
      searchable: true,
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, row : Network, __, highlightFn) => {
        const { name } = row
        return <TenantLink
          to={`/networks/wireless/${name}/network-details/incidents`}
        >
          {highlightFn(name)}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'AP Count' }),
      dataIndex: 'apCount',
      key: 'apCount',
      width: 130,
      sorter: { compare: sortProp('apCount', defaultSort) },
      render: (_, row) => {
        return row.apCount ? formatter('countFormat')(row.apCount) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Client Count' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      width: 80,
      sorter: { compare: sortProp('clientCount', defaultSort) },
      render: (_, row) => {
        return row.clientCount ? formatter('countFormat')(row.clientCount) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Traffic' }),
      dataIndex: 'traffic',
      key: 'traffic',
      width: 100,
      sorter: { compare: sortProp('traffic', defaultSort) },
      render: (_, row) => {
        return row.traffic ? formatter('bytesFormat')(row.traffic) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Rx Traffic' }),
      width: 90,
      dataIndex: 'rxBytes',
      key: 'rxBytes',
      sorter: { compare: sortProp('rxBytes', defaultSort) },
      render: (_, row) => {
        return row.rxBytes ? formatter('bytesFormat')(row.rxBytes) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Tx Traffic' }),
      width: 90,
      dataIndex: 'txBytes',
      key: 'txBytes',
      sorter: { compare: sortProp('txBytes', defaultSort) },
      render: (_, row) => {
        return row.txBytes ? formatter('bytesFormat')(row.txBytes) : '--'
      }
    }
  ]

  return <Loader states={[results]}>
    <Table<Network>
      columns={networkTableColumnHeaders}
      dataSource={results.data?.wifiNetwork as unknown as Network[]}
      pagination={pagination}
      settingsId='wifi-network-search-table'
      onFilterChange={updateSearchString}
    />
  </Loader>
}
