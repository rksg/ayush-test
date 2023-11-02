import { useState } from 'react'

import { useIntl } from 'react-intl'

import { AP, useApListQuery }                                       from '@acx-ui/analytics/services'
import { defaultSort, sortProp ,formattedPath, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip, useDateRange, Loader, Filter } from '@acx-ui/components'
import { TenantLink }                                               from '@acx-ui/react-router-dom'
import {
  NetworkPath, PathNode
} from '@acx-ui/utils'

import { useZoneWiseApListQuery } from './services'
import {  Ul, Chevron, Li }       from './styledComponents'
export  function APList (
  {
    searchVal = '',
    shouldQueryZoneWiseApList = { searchString: '', path: [{} as PathNode] }
  }
  :
  {
    searchVal?: string,
    shouldQueryZoneWiseApList?:
    { searchString : string, path: NetworkPath } }) {
  const { $t } = useIntl()

  // const { timeRange } = useDateRange()
  const { filters } = useAnalyticsFilter()
  const pagination = { pageSize: 10, defaultPageSize: 10 }
  const [searchString, setSearchString] = useState(searchVal)
  const apListQuery = useZoneWiseApListQuery
  const results = apListQuery({
    start: filters.startDate,
    end: filters.endDate,
    limit: 10000,
    query: '',
    filter: { networkNodes: [shouldQueryZoneWiseApList.path] }
  })
  console.log(results)

  const updateSearchString = (_: Filter, search: { searchString?: string }) => {
    setSearchString(search.searchString!)
  }

  const apTablecolumnHeaders: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      width: 130,
      searchable: true,
      sorter: { compare: sortProp('apName', defaultSort) },
      render: (_, row: AP, __, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.macAddress}/details/overview`}>
          {highlightFn(row.apName)}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'mac',
      width: 130,
      searchable: true,
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Model' }),
      dataIndex: 'apModel',
      key: 'apModel',
      width: 80,
      searchable: true,
      sorter: { compare: sortProp('apModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      searchable: true,
      width: 100,

      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      width: 90,
      dataIndex: 'version',
      key: 'version',
      searchable: true,
      sorter: { compare: sortProp('version', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      width: 450,
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value) => {
        const networkPath = value.networkPath.slice(1, -1)
        return (
          <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
            <Ul>
              {networkPath.map(({ name }, index) => [
                index !== 0 && <Chevron key={`ap-chevron-${index}`}>{'>'}</Chevron>,
                <Li key={`ap-li-${index}`}>{name}</Li>
              ])}
            </Ul>
          </Tooltip>
        )
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  return <Loader states={[results]}>
    <Table<AP>
      columns={apTablecolumnHeaders}
      dataSource={results.data?.network.search.aps as unknown as AP[]}
      pagination={pagination}
      settingsId='ap-search-table'
      onFilterChange={updateSearchString}
    />
  </Loader>
}
