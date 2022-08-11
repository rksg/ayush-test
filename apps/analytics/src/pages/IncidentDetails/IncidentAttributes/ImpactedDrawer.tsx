import React, { useState } from 'react'

import { Tooltip }                   from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { aggregateDataBy }                              from '@acx-ui/analytics/utils'
import { IncidentDetailsProps }                         from '@acx-ui/analytics/utils'
import { Drawer, Loader, Table, SearchBar, TableProps } from '@acx-ui/components'
import { InformationOutlined }                          from '@acx-ui/icons'
import { TenantLink }                                   from '@acx-ui/react-router-dom'

import {
  ImpactedAP,
  ImpactedClient,
  useImpactedAPsQuery,
  useImpactedClientsQuery
} from './services'
import { Title } from './syledComponents'

export interface impactedDrawerProps extends Pick<IncidentDetailsProps, 'id'> {
  visible: boolean
  onClose: () => void
}

export interface AggregatedImpactedAP{
  name: string[]
  mac: string[]
  model: string[]
  version: string[]
}

export interface AggregatedImpactedClient{
  mac: string []
  manufacturer: string[]
  ssid: string[]
  hostname: string[]
  username: string[]
}

export function sortCell<T> (column: keyof T) {
  return function (a: T, b: T) {
    const dataA = a[column] as unknown as T[keyof T][]
    const dataB = b[column] as unknown as T[keyof T][]
    return dataA[0] > dataB[0]? 1: -1
  }
}

export function renderCell<T> (col: keyof T) {
  return function (_: React.ReactNode, row: T) {
    const data = row[col] as unknown as T[keyof T][]
    return <span title={data.join(', ')}>
      {`${data[0]} ${data.length > 1 ? `(${data.length})` : ''}`}
    </span>
  }
}

const tooltips = {
  // eslint-disable-next-line max-len
  username: <FormattedMessage defaultMessage='The username may only be known if the user has successfully passed authentication'/>,
  // eslint-disable-next-line max-len
  hostname: <FormattedMessage defaultMessage='The hostname may only be known if the user has successfully obtained an IP address from DHCP'/>
}

const impactedClientsColumns: TableProps<AggregatedImpactedClient>['columns'] = [
  {
    title: 'Client MAC',
    dataIndex: 'mac',
    key: 'mac',
    render: (_, row) =>
      <Tooltip title={<FormattedMessage defaultMessage='Client Troubleshoot'/>}>
        <TenantLink to={'TBD'}>{row.mac}</TenantLink>
      </Tooltip>,
    sorter: sortCell<AggregatedImpactedClient>('mac')
  },
  {
    title: 'Manufacturer',
    dataIndex: 'manufacturer',
    key: 'manufacturer',
    render: renderCell<AggregatedImpactedClient>('manufacturer'),
    sorter: sortCell<AggregatedImpactedClient>('manufacturer')
  },
  {
    title: 'SSID',
    dataIndex: 'ssid',
    key: 'ssid',
    render: renderCell<AggregatedImpactedClient>('ssid'),
    sorter: sortCell<AggregatedImpactedClient>('ssid')
  },
  {
    title: (
      <Title>
        Username
        <Tooltip title={tooltips.username}>
          <InformationOutlined/>
        </Tooltip>
      </Title>
    ),
    dataIndex: 'username',
    key: 'username',
    render: renderCell<AggregatedImpactedClient>('username'),
    sorter: sortCell<AggregatedImpactedClient>('username')
  },
  {
    title: (
      <Title>
        Hostname
        <Tooltip placement='topLeft' title={tooltips.hostname}>
          <InformationOutlined/>
        </Tooltip>
      </Title>
    ),
    dataIndex: 'hostname',
    key: 'hostname',
    render: renderCell<AggregatedImpactedClient>('hostname'),
    sorter: sortCell<AggregatedImpactedClient>('hostname')
  }
]


export const ImpactedClientsDrawer: React.FC<impactedDrawerProps> = (props) => {
  const { $t } = useIntl()
  const [ search, setSearch ] = useState('')
  const queryResults = useImpactedClientsQuery({
    id: props.id,
    search,
    n: 100
  }, { selectFromResult: (states) => ({
    ...states,
    isLoading: false,
    isFetching: states.isLoading || states.isFetching,
    data: states.data && aggregateDataBy<ImpactedClient>('mac')(states.data)
  }) })
  return <Drawer
    width={'620px'}
    title={$t(
      { defaultMessage: '{count} Impacted {count, plural, one {Client} other {Clients}}' },
      { count: `${queryResults.data?.length || ''}` }
    )}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <SearchBar onChange={setSearch}/>
      <Table<AggregatedImpactedClient>
        columns={impactedClientsColumns}
        dataSource={queryResults.data?.map((row, key)=>({ key, ...row }))}/>
    </Loader>}
  />
}

const impactedAPsColumns: TableProps<AggregatedImpactedAP>['columns'] = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name',
    render: renderCell<AggregatedImpactedAP>('name'),
    sorter: sortCell<AggregatedImpactedAP>('name')
  },
  {
    title: 'AP MAC',
    dataIndex: 'mac',
    key: 'mac',
    render: (_, row) =>
      <Tooltip title={<FormattedMessage defaultMessage='AP Details'/>}>
        <TenantLink to={'TBD'}>{row.mac}</TenantLink>
      </Tooltip>,
    sorter: sortCell<AggregatedImpactedAP>('mac')
  },
  {
    title: 'AP Model',
    dataIndex: 'model',
    key: 'model',
    render: renderCell<AggregatedImpactedAP>('model'),
    sorter: sortCell<AggregatedImpactedAP>('model')
  },
  {
    title: 'AP Version',
    dataIndex: 'version',
    key: 'version',
    render: renderCell<AggregatedImpactedAP>('version'),
    sorter: sortCell<AggregatedImpactedAP>('version')
  }
]

export const ImpactedAPsDrawer: React.FC<impactedDrawerProps> = (props) => {
  const { $t } = useIntl()
  const [ search, setSearch ] = useState('')
  const queryResults = useImpactedAPsQuery({
    id: props.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states,
    isLoading: false,
    isFetching: states.isLoading || states.isFetching,
    data: states.data && aggregateDataBy<ImpactedAP>('mac')(states.data)
  }) })
  return <Drawer
    width={'620px'}
    title={$t(
      { defaultMessage: '{count} Impacted {count, plural, one {AP} other {APs}}' },
      { count: `${queryResults.data?.length || ''}` }
    )}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <SearchBar onChange={setSearch}/>
      <Table<AggregatedImpactedAP>
        columns={impactedAPsColumns}
        dataSource={queryResults.data?.map((row, key)=>({ key, ...row }))}/>
    </Loader>}
  />
}
