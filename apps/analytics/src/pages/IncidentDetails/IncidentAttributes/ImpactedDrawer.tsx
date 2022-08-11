import React, { useMemo, useState } from 'react'

import { Tooltip }                   from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { aggregateDataBy }                   from '@acx-ui/analytics/utils'
import type { Incident }                     from '@acx-ui/analytics/utils'
import { Drawer, Loader, Table, SearchBar  } from '@acx-ui/components'
import type { TableColumn, ColumnType }      from '@acx-ui/components'
import { InformationOutlined }               from '@acx-ui/icons'
import { TenantLink }                        from '@acx-ui/react-router-dom'

import {
  ImpactedAP,
  ImpactedClient,
  useImpactedAPsQuery,
  useImpactedClientsQuery
} from './services'
import { Title } from './syledComponents'

export interface ImpactedDrawerProps extends Pick<Incident, 'id'> {
  visible: boolean
  onClose: () => void
}

export interface AggregatedImpactedAP {
  name: string[]
  mac: string[]
  model: string[]
  version: string[]
}

export interface AggregatedImpactedClient {
  mac: string []
  manufacturer: string[]
  ssid: string[]
  hostname: string[]
  username: string[]
}

export function column <RecordType> (
  column: keyof RecordType,
  columnProps: Partial<ColumnType<RecordType>> = {}
): Partial<ColumnType<RecordType>> {
  function sorter (a: RecordType, b: RecordType) {
    const dataA = a[column] as unknown as RecordType[keyof RecordType][]
    const dataB = b[column] as unknown as RecordType[keyof RecordType][]
    return dataA[0] > dataB[0]? 1: -1
  }

  function render (value: unknown) {
    const data = value as RecordType[keyof RecordType][]
    return <span title={data.join(', ')}>
      {`${data[0]} ${data.length > 1 ? `(${data.length})` : ''}`}
    </span>
  }

  return {
    dataIndex: column as string,
    key: column as string,
    render,
    sorter,
    ...columnProps
  }
}

const tooltips = {
  // eslint-disable-next-line max-len
  username: <FormattedMessage defaultMessage='The username may only be known if the user has successfully passed authentication'/>,
  // eslint-disable-next-line max-len
  hostname: <FormattedMessage defaultMessage='The hostname may only be known if the user has successfully obtained an IP address from DHCP'/>
}

export const ImpactedClientsDrawer: React.FC<ImpactedDrawerProps> = (props) => {
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

  const columns = useMemo(() => [
    column('mac', {
      title: $t({ defaultMessage: 'Client MAC' }),
      render: (_, row) =>
        <Tooltip title={$t({ defaultMessage: 'Client Troubleshoot' })}>
          <TenantLink to={'TBD'}>{row.mac}</TenantLink>
        </Tooltip>
    }),
    column('manufacturer', { title: $t({ defaultMessage: 'Manufacturer' }) }),
    column('ssid', { title: $t({ defaultMessage: 'SSID' }) }),
    column('username', {
      title: <Title>
        {$t({ defaultMessage: 'Username' })}
        <Tooltip title={tooltips.username}>
          <InformationOutlined/>
        </Tooltip>
      </Title>
    }),
    column('hostname', {
      title: <Title>
        {$t({ defaultMessage: 'Hostname' })}
        <Tooltip placement='topLeft' title={tooltips.hostname}>
          <InformationOutlined/>
        </Tooltip>
      </Title>
    })
  ] as TableColumn<AggregatedImpactedClient>[], [$t])

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
        rowKey='mac'
        columns={columns}
        dataSource={queryResults.data}
      />
    </Loader>}
  />
}

export const ImpactedAPsDrawer: React.FC<ImpactedDrawerProps> = (props) => {
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

  const columns = useMemo(() => [
    column('name', { title: $t({ defaultMessage: 'AP Name' }) }),
    column('mac', {
      title: $t({ defaultMessage: 'AP MAC' }),
      render: (_, row) =>
        <Tooltip title={<FormattedMessage defaultMessage='AP Details'/>}>
          <TenantLink to={'TBD'}>{row.mac}</TenantLink>
        </Tooltip>
    }),
    column('model', { title: $t({ defaultMessage: 'AP Model' }) }),
    column('version', { title: $t({ defaultMessage: 'AP Version' }) })
  ] as TableColumn<AggregatedImpactedAP>[], [$t])

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
        rowKey='mac'
        columns={columns}
        dataSource={queryResults.data}/>
    </Loader>}
  />
}
