import { Table as AntdTable } from 'antd'
import moment                 from 'moment-timezone'
import { useIntl }            from 'react-intl'
import { useParams }          from 'react-router-dom'

import { useSearchQuery, AP, Client,NetworkHierarchy,Switch } from '@acx-ui/analytics/services'
import { defaultSort, sortProp ,formattedPath }               from '@acx-ui/analytics/utils'
import { PageHeader, Loader, Table, TableProps, Tooltip }     from '@acx-ui/components'
import { DateFormatEnum, formatter }                          from '@acx-ui/formatter'

import NoData              from './NoData'
import { Collapse, Panel } from './styledComponents'


//import { useDefaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import { Ul, Chevron, Li } from './styledComponents'

import type { ColumnsType } from 'antd/es/table'

const pagination = { pageSize: 5, defaultPageSize: 5 }

const params = {
  start: moment().subtract(7, 'days').seconds(0).format(),
  end: moment().format(),
  limit: 10
}





function SearchResult ({ searchVal }: { searchVal: string| undefined }) {
  const { $t } = useIntl()
  const results = useSearchQuery(
    { ...params, query: searchVal! }
    // { selectFromResult: (states) => {
    //   // ...states,
    //   // data: states.data && aggregateDataBy<AP>('mac')(states.data.aps)
    //   console.log('## aggregateDataBy',
    //     states.data && aggregateDataBy<AP>('macAddress')(states.data.aps))
    //   //return states
    //   return {
    //     ...states,
    //     data: states.data && {
    //       aps: aggregateDataBy<AP>('macAddress')(states.data.aps),
    //       networkHierarchy: aggregateDataBy<NetworkHierarchy>('macAddress')(
    //         states.data.networkHierarchy
    //       ),
    //       clients: aggregateDataBy<Client>('macAddress')(states.data.clients),
    //       switches: aggregateDataBy<Switch>('macAddress')(states.data.switches)
    //     }
    //   }
    // }
    // }
  )
  //const count = results.data.reduce((count, { result }) => count + (result.data?.totalCount || 0), 0)
  // console.log( '###### results: ', JSON.stringify(results.data,null,1))
  let count = 0
  results.data && Object.entries(results.data).forEach(([, value]) => {
    count += (value as []).length || 0
  })


  //const count = 11

  const apTablecolumnHeaders: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      width: 100,
      dataIndex: 'apName',
      key: 'apName',
      //fixed: 'left',
      ellipsis: true
      //searchable: true,
      // render: (value: unknown) => {
      //   return value ?
      //     (value as string) : '-'
      // }

      //sorter: { compare: sortProp('apName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      width: 100,
      dataIndex: 'macAddress',
      key: 'mac',
      fixed: 'left',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Model' }),
      dataIndex: 'apModel',
      key: 'apModel',
      fixed: 'left',
      width: 100,
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('apModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'version',
      key: 'version',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('version', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value ) => {
        const networkPath = value.networkPath.slice(0, -1)
        return <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key='chevron'>{'>'}</Chevron>,
              <Li key={index}>{name}</Li>
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
      ellipsis: true,
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('hostname', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'username',
      key: 'username',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('username', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      width: 100,
      dataIndex: 'mac',
      key: 'mac',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      width: 100,
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'OS Type' }),
      dataIndex: 'osType',
      key: 'osType',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('osType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Last Connection' }),
      dataIndex: 'lastActiveTime',
      key: 'lastActiveTime',
      render: (value: unknown) => {
        return value ? (formatter(DateFormatEnum.DateTimeFormat)(value)) : '-'
      },
      sorter: { compare: sortProp('lastActiveTime', defaultSort) }
    }

  ]

  const switchTablecolumnHeaders: TableProps<Switch>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: 'switchName',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('switchName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'switchMac',
      key: 'switchMac',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('switchMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'switchModel',
      key: 'switchModel',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('switchModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      width: 100,
      dataIndex: 'switchVersion',
      key: 'switchVersion',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('switchVersion', defaultSort) }
    }
  ]

  const networkHierarchyTablecolumnHeaders: TableProps<NetworkHierarchy>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type',
      fixed: 'left',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'System' }),
      dataIndex: 'root',
      key: 'root',
      fixed: 'left',
      render: (value: unknown) => {
        return value ? (value as string) : '-'
      },
      sorter: { compare: sortProp('root', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Ap Count' }),
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
      render: (_, value ) => {
        const networkPath = value.networkPath.slice(0, -1)
        return <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key='chevron'>{'>'}</Chevron>,
              <Li key={index}>{name}</Li>
            ])}
          </Ul>
        </Tooltip>
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  return <Loader states={[results]}>
    {count
      ? <>
        <PageHeader title={$t(
          { defaultMessage: 'Search Results for "{searchVal}" ({count})' },
          { searchVal, count }
        )} />
        <Collapse
          defaultActiveKey={Object.keys(results)}
        >
          { results.data?.aps.length &&
            <Panel
              key='aps'
              header={`APs (${results.data?.aps.length})`}>
              <Table<AP>
                columns={apTablecolumnHeaders}
                dataSource={results.data?.aps as unknown as AP[]}
                pagination={pagination}
              />
            </Panel>
          }
          { results.data?.clients.length &&
            <Panel
              key='clients'
              header={`Clients (${results.data?.clients.length})`}>
              <Table<Client>
                columns={clientTablecolumnHeaders}
                dataSource={results.data?.clients as unknown as Client[]}
                pagination={pagination}
              />
            </Panel>
          }
          { results.data?.switches.length &&
            <Panel
              key='switches'
              header={`Switches (${results.data?.switches.length})`}>
              <Table<Switch>
                columns={switchTablecolumnHeaders}
                dataSource={results.data?.switches as unknown as Switch[]}
                pagination={pagination}
              />
            </Panel>
          }
          { results.data?.networkHierarchy.length &&
            <Panel
              key='networkHierarchy'
              header={`Network Hierarchy (${results.data?.networkHierarchy.length})`}>
              <Table<NetworkHierarchy>
                columns={networkHierarchyTablecolumnHeaders}
                dataSource={results.data?.networkHierarchy as unknown as NetworkHierarchy[]}
                pagination={pagination}
              />
            </Panel>
          }
        </Collapse>
      </>
      : <>
        <PageHeader title={$t(
          { defaultMessage: 'Hmmmm... we couldn’t find any match for "{searchVal}"' },
          { searchVal }
        )} />
        <NoData />
      </>
    }

  </Loader>
}

export default function SearchResults () {
  const { searchVal } = useParams()
  return <SearchResult key={searchVal} searchVal={searchVal} />
}
