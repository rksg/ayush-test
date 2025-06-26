import { useState } from 'react'

import { useIntl } from 'react-intl'

import { AP, useApListQuery }                                                           from '@acx-ui/analytics/services'
import { defaultSort, sortProp ,formattedPath, useAnalyticsFilter, QueryParamsForZone } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip, useDateRange, Loader }                             from '@acx-ui/components'
import { formatter }                                                                    from '@acx-ui/formatter'
import { TenantLink }                                                                   from '@acx-ui/react-router-dom'
import type { Filter }                                                                  from '@acx-ui/types'

import {  Ul, Chevron, Li } from './styledComponents'

export function APList ({
  searchVal = '',
  queryParamsForZone
}: {
  searchVal?: string;
  queryParamsForZone?: QueryParamsForZone;
}) {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const { filters } = useAnalyticsFilter()
  const pagination = { pageSize: 10, defaultPageSize: 10 }
  const [searchString, setSearchString] = useState(searchVal)
  const requestPayload = Boolean(queryParamsForZone)
    ? {
      start: filters.startDate,
      end: filters.endDate,
      query: queryParamsForZone?.searchString ?? '',
      filter: { networkNodes: queryParamsForZone?.path },
      // Set to a limit of 10,000 because that is the maximum number of APs allowed in each Zone
      limit: 10000
    }
    : {
      start: timeRange[0].format(),
      end: timeRange[1].format(),
      limit: 100,
      metric: 'traffic',
      query: searchString,
      filter: {}
    }
  const results = useApListQuery(requestPayload)
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
        <TenantLink to={`/devices/wifi/${row.macAddress}/details/ai`}>
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
      title: $t({ defaultMessage: 'Traffic (Total)' }),
      width: 110,
      dataIndex: 'traffic',
      key: 'traffic',
      render: (_, { traffic }) => {
        return formatter('bytesFormat')(traffic)
      },
      sorter: { compare: sortProp('traffic', defaultSort) }
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

  const data = results.data?.aps?.map((item: AP, i) => ({
    ...item,
    rowId: i+1
  }))

  return <Loader states={[results]}>
    <Table<AP>
      rowKey='rowId'
      columns={apTablecolumnHeaders}
      dataSource={data as AP[]}
      pagination={pagination}
      settingsId='ap-search-table'
      onFilterChange={updateSearchString}
    />
  </Loader>
}
