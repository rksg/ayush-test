import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  useSearchQuery,
  AP,
  Client,
  Network,
  NetworkHierarchy,
  Switch
} from '@acx-ui/analytics/services'
import {
  defaultSort,
  sortProp,
  formattedPath,
  encodeFilterPath
} from '@acx-ui/analytics/utils'
import {
  PageHeader,
  Loader,
  Table,
  TableProps,
  Tooltip,
  TimeRangeDropDown,
  useDateRange,
  TimeRangeDropDownProvider
} from '@acx-ui/components'
import { DateFormatEnum, formatter }                                       from '@acx-ui/formatter'
import { useParams, TenantLink }                                           from '@acx-ui/react-router-dom'
import { hasRaiPermission }                                                from '@acx-ui/user'
import { DateRange, fixedEncodeURIComponent, encodeParameter, DateFilter } from '@acx-ui/utils'

import { getZoneUrl } from '../ZoneDetails/ZoneTabs'

import NoData                               from './NoData'
import { Collapse, Panel, Ul, Chevron, Li } from './styledComponents'

const pagination = { pageSize: 5, defaultPageSize: 5 }

function SearchResult ({ searchVal }: { searchVal: string | undefined }) {
  const { $t } = useIntl()
  const { timeRange } = useDateRange()
  const results = useSearchQuery({
    start: timeRange[0].format(),
    end: timeRange[1].format(),
    limit: 100,
    query: searchVal!
  })
  let count = 0
  results.data && Object.entries(results.data).forEach(([, value]) => {
    count += value?.length || 0
  })
  const apTablecolumnHeaders: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      width: 130,
      sorter: { compare: sortProp('apName', defaultSort) },
      render: (_, row: AP) => {
        const filter = encodeFilterPath('analytics', row.networkPath)
        const link = hasRaiPermission('READ_ACCESS_POINTS_LIST')
          ? `/devices/wifi/${row.macAddress}/details/ai`
          : `/reports/aps?${filter}`
        return <TenantLink to={link}>{row.apName}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'mac',
      width: 100,
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Model' }),
      dataIndex: 'apModel',
      key: 'apModel',
      width: 70,
      sorter: { compare: sortProp('apModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 80,
      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      width: 70,
      dataIndex: 'version',
      key: 'version',
      sorter: { compare: sortProp('version', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      width: 450,
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value) => {
        const networkPath = value.networkPath.slice(1)
        return <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key={`ap-chevron-${index}`}>{'>'}</Chevron>,
              <Li key={`ap-li-${index}`}>{name}</Li>
            ])}
          </Ul>
        </Tooltip>
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  const clientTablecolumnHeaders: TableProps<Client>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      key: 'hostname',
      fixed: 'left',
      render: (_, row: Client) => {
        const { lastActiveTime, mac, hostname } = row
        const period = encodeParameter<DateFilter>({
          startDate: moment(lastActiveTime).subtract(4, 'hours').format(),
          endDate: moment.min([moment(), moment(lastActiveTime).add(4, 'hours')]).format(),
          range: DateRange.custom
        })
        const link = hasRaiPermission('READ_CLIENT_TROUBLESHOOTING')
          ? `/users/wifi/clients/${mac}/details/troubleshooting?period=${period}`
          : `/users/wifi/clients/${mac}/details/reports`
        return <TenantLink to={link}>{hostname}</TenantLink>
      },
      sorter: { compare: sortProp('hostname', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'username',
      key: 'username',
      sorter: { compare: sortProp('username', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      width: 100,
      dataIndex: 'mac',
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      width: 100,
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Manufacturer' }),
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      sorter: { compare: sortProp('manufacturer', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'OS Type' }),
      dataIndex: 'osType',
      key: 'osType',
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

  const switchTablecolumnHeaders: TableProps<Switch>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: 'switchName',
      render: (_, row: Switch) => {
        return <TenantLink to={`/devices/switch/${row.switchMac}/serial/details/incidents`}>
          {row.switchName}</TenantLink>
      },
      sorter: { compare: sortProp('switchName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'switchMac',
      key: 'switchMac',

      sorter: { compare: sortProp('switchMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'switchModel',
      key: 'switchModel',
      sorter: { compare: sortProp('switchModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'switchVersion',
      key: 'switchVersion',
      sorter: { compare: sortProp('switchVersion', defaultSort) }
    }
  ]

  const networkHierarchyTablecolumnHeaders: TableProps<NetworkHierarchy>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (_, row: NetworkHierarchy) => {
        const networkPath = row.networkPath.slice(1)
        const filter = encodeFilterPath('analytics', row.networkPath)
        const defaultPath = row.type.toLowerCase() === 'zone'
          ? `${getZoneUrl(networkPath?.[0]?.name, networkPath?.[1]?.name)}/assurance`
          : `/incidents?${filter}`
        const reportOnly = row.type.toLowerCase().includes('switch')
          ? `/reports/switches?${filter}`
          : `/reports/wireless?${filter}`
        const link = hasRaiPermission('READ_INCIDENTS')
          ? defaultPath
          : reportOnly
        return <TenantLink to={link}>{row.name}</TenantLink>
      },
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type',
      fixed: 'left',
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'System' }),
      dataIndex: 'root',
      key: 'root',
      fixed: 'left',
      sorter: { compare: sortProp('root', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Count' }),
      width: 100,
      dataIndex: 'apCount',
      key: 'apCount',
      sorter: { compare: sortProp('apCount', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Switch Count' }),
      width: 120,
      dataIndex: 'switchCount',
      key: 'switchCount',
      sorter: { compare: sortProp('switchCount', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value) => {
        const networkPath = value.networkPath.slice(1)
        return <Tooltip placement='left' title={formattedPath(value.networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key={`network-chevron-${index}`}>{'>'}</Chevron>,
              <Li key={`network-li-${index}`}>{name}</Li>
            ])}
          </Ul>
        </Tooltip>
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  const wifiNetworksTableColumnHeaders: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, row: Network) => {
        const { name } = row
        return <TenantLink
          to={`/networks/wireless/${fixedEncodeURIComponent(name)}/network-details/reports`}
        >
          {name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'APs With Connected Clients' }),
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

  const extra = [<TimeRangeDropDown />]
  return <Loader states={[results]}>
    {count
      ? <>
        <PageHeader title={$t(
          { defaultMessage: 'Search Results for "{searchVal}" ({count})' },
          { searchVal, count }
        )}
        extra={extra}
        />
        <Collapse
          defaultActiveKey={Object.keys(results.data!)}
        >
          {results.data?.aps?.length &&
            <Panel
              key='aps'
              header={`${$t({ defaultMessage: 'APs' })} (${results.data?.aps.length})`}>
              <Table<AP>
                columns={apTablecolumnHeaders}
                dataSource={results.data?.aps as unknown as AP[]}
                pagination={pagination}
                settingsId='ap-search-table'
                rowKey='macAddress'
              />
            </Panel>
          }
          {results.data?.wifiNetworks?.length &&
            <Panel
              key='wifiNetworks'
              header={
                `${$t({
                  defaultMessage: 'Wi-Fi Networks'
                })} (${results.data?.wifiNetworks.length})`
              }>
              <Table<Network>
                columns={wifiNetworksTableColumnHeaders}
                dataSource={results.data?.wifiNetworks as unknown as Network[]}
                pagination={pagination}
                settingsId='wifi-networks-search-table'
                rowKey='name'
              />
            </Panel>
          }
          {results.data?.clients?.length &&
            <Panel
              key='clients'
              header={`${$t({ defaultMessage: 'Clients' })} (${results.data?.clients.length})`}>
              <Table<Client>
                columns={clientTablecolumnHeaders}
                dataSource={results.data?.clients as unknown as Client[]}
                pagination={pagination}
                settingsId='clients-search-table'
                rowKey='mac'
              />
            </Panel>
          }
          {results.data?.switches?.length &&
            <Panel
              key='switches'
              header={`${$t({ defaultMessage: 'Switches' })} (${results.data?.switches.length})`}>
              <Table<Switch>
                columns={switchTablecolumnHeaders}
                dataSource={results.data?.switches as unknown as Switch[]}
                pagination={pagination}
                settingsId='switch-search-table'
                rowKey='switchMac'
              />
            </Panel>
          }
          {results.data?.networkHierarchy?.length &&
            <Panel
              key='networkHierarchy'
              header={
                `${$t({
                  defaultMessage: 'Network Hierarchy'
                })} (${results.data?.networkHierarchy.length})`
              }>
              <Table<NetworkHierarchy>
                columns={networkHierarchyTablecolumnHeaders}
                dataSource={results.data?.networkHierarchy as unknown as NetworkHierarchy[]}
                pagination={pagination}
                settingsId='network-hierarchy-search-table'
                rowKey='name'
              />
            </Panel>
          }
        </Collapse>
      </>
      : <>
        <PageHeader title={$t(
          { defaultMessage: 'Hmmmm... we couldn’t find any match for "{searchVal}"' },
          { searchVal }
        )}
        extra={extra}
        />
        <NoData />
      </>
    }
  </Loader>
}

export default function SearchResults () {
  const { searchVal } = useParams()
  const trimmedSearchVal = searchVal?.trim()
  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last24Hours,
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <SearchResult key={trimmedSearchVal} searchVal={trimmedSearchVal} />
  </TimeRangeDropDownProvider>
}
