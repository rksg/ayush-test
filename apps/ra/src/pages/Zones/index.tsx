import { useState, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { defaultSort, sortProp, formattedPath }                                                              from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, useDateRange, PageHeader, TimeRangeDropDown, TimeRangeDropDownProvider } from '@acx-ui/components'
import {
  Tooltip
} from '@acx-ui/components'
import { intlFormats }                                           from '@acx-ui/formatter'
import { TenantLink, resolvePath }                               from '@acx-ui/react-router-dom'
import {  NetworkPath, DateRange, encodeParameter, DateFilter  } from '@acx-ui/utils'

import { useZonesListQuery, Zone } from './services'
import * as UI                     from './styledComponents'

const pagination = { pageSize: 10, defaultPageSize: 10 }

function ZonesList () {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()
  const results = useZonesListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format()
  })
  const period = encodeParameter<DateFilter>({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    range: selectedRange
  })
  const columns: TableProps<Zone>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'zoneName',
      key: 'zoneName',
      fixed: 'left',
      searchable: true,
      width: 200,
      render: (_, row: Zone, __, highlightFn) => (
        <TenantLink
          to={resolvePath(`/zones/${row.systemName}/${row.zoneName}/assurance?period=${period}`)}>
          {highlightFn(row.zoneName)}
        </TenantLink>
      )
      ,
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      dataIndex: 'network',
      key: 'network',
      searchable: true,
      sorter: { compare: sortProp('network', defaultSort) },
      width: 250,
      render: (_, row, __, highlightFn) => {
        const networkPath = [
          { type: 'system', name: row.systemName },
          ...(row.domain ? [{ type: 'domain', name: row.domain?.split('||')?.[1] }] : [])
        ] as NetworkPath
        return (
          <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
            <UI.Ul>
              {networkPath.map(({ name }, index) => [
                index !== 0 && <UI.Chevron key={`network-chevron-${index}`}>{'>'}</UI.Chevron>,
                <UI.Li key={`network-li-${index}`}>{highlightFn(name)}</UI.Li>
              ])}
            </UI.Ul>
          </Tooltip>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Ap Count' }),
      dataIndex: 'apCount',
      key: 'apCount',
      sorter: { compare: sortProp('apCount', defaultSort) },
      render: (_, row: Zone) => (
        <TenantLink
          to={resolvePath(`/zones/${row.systemName}/${row.zoneName}/devices?period=${period}`)}
          title={row.apCount as unknown as string}>
          {$t(intlFormats.countFormat, { value: row.apCount })}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Client Count' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      sorter: { compare: sortProp('clientCount', defaultSort) },
      render: (_, row: Zone) => (
        <TenantLink
          to={resolvePath(`/zones/${row.systemName}/${row.zoneName}/clients?period=${period}`)}
          title={row.clientCount as unknown as string}>
          {$t(intlFormats.countFormat, { value: row.clientCount })}
        </TenantLink>
      )
    }
  ]
  const [count, setCount] = useState(0)
  useEffect(() => {
    Array.isArray(results.data?.zones) && setCount(results.data?.zones?.length!)
  }, [results.data])
  return (
    <Loader states={[results]}>
      <PageHeader
        title={$t({ defaultMessage: 'Zones ({count})' }, { count })}
        extra={[<TimeRangeDropDown/>]}
      />
      <Table<Zone>
        columns={columns}
        dataSource={results.data?.zones as Zone[]}
        pagination={pagination}
        settingsId='zonesList-table'
        rowKey='id'
        onDisplayRowChange={(data) => setCount(data.length)}
      />
    </Loader>
  )
}
export default function Zones () {
  return (
    <TimeRangeDropDownProvider
      availableRanges={[
        DateRange.last24Hours,
        DateRange.last7Days,
        DateRange.last30Days
      ]}>
      <ZonesList />
    </TimeRangeDropDownProvider>
  )
}
