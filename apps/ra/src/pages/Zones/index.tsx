

import { useIntl } from 'react-intl'

import { defaultSort, sortProp, formattedPath }                                                              from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, useDateRange, PageHeader, TimeRangeDropDown, TimeRangeDropDownProvider } from '@acx-ui/components'
import {
  Tooltip
} from '@acx-ui/components'
import { TenantLink, resolvePath }                          from '@acx-ui/react-router-dom'
import {  NetworkPath, fixedEncodeURIComponent, DateRange } from '@acx-ui/utils'

import { useZonesListQuery, Zone } from './services'
import * as UI                     from './styledComponents'


const pagination = { pageSize: 10, defaultPageSize: 10 }



function ZonesList () {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const results = useZonesListQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format()
  })

  const networkHierarchyTablecolumnHeaders: TableProps<Zone>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'zoneName',
      key: 'zoneName',
      fixed: 'left',
      searchable: true,
      render: (_, row: Zone) => (
        <TenantLink
          to={resolvePath(
            `/incidents?analyticsNetworkFilter=${fixedEncodeURIComponent(
              JSON.stringify({ raw: row.zoneName, path: row.zoneName })
            )}`
          )}>
          {row.zoneName}
        </TenantLink>
      ),
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      dataIndex: 'systemName',
      key: 'systemName',
      sorter: { compare: sortProp('systemName', defaultSort) },
      render: (_, row) => {
        const networkPath = [
          { type: 'system', name: row.systemName },
          { type: 'domain', name: row.domain }
        ] as NetworkPath
        return (
          <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
            <UI.Ul>
              {networkPath.map(({ name }, index) => [
                index !== 0 && <UI.Chevron key={`network-chevron-${index}`}>{'>'}</UI.Chevron>,
                <UI.Li key={`network-li-${index}`}>{name}</UI.Li>
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
      width: 150,
      sorter: { compare: sortProp('apCount', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Client Count' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      sorter: { compare: sortProp('clientCount', defaultSort) },
      width: 150
    }
  ]
  const count = results.data?.zones?.length ?? 0
  return (
    <Loader states={[results]}>
      <PageHeader
        title={$t({ defaultMessage: 'Zones ({count})' }, { count })}
        extra={[<TimeRangeDropDown/>]}
      />
      <Table<Zone>
        columns={networkHierarchyTablecolumnHeaders}
        dataSource={results.data?.zones as Zone[]}
        pagination={pagination}
        settingsId='network-hierarchy-search-table'
      />
    </Loader>
  )
}
export default function Zones () {
  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last24Hours,
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <ZonesList />
  </TimeRangeDropDownProvider>
}