import React, { useMemo, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { aggregateDataBy }                                    from '@acx-ui/analytics/utils'
import type { Incident }                                      from '@acx-ui/analytics/utils'
import { Drawer, Loader, Table }                              from '@acx-ui/components'
import type { TableHighlightFnArgs, TableColumn, ColumnType } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { TenantLink }                                         from '@acx-ui/react-router-dom'
import { getIntl, encodeParameter, DateFilter, DateRange }    from '@acx-ui/utils'

import {
  ImpactedAP,
  ImpactedClient,
  useImpactedAPsQuery,
  useImpactedClientsQuery
} from './services'

export interface ImpactedDrawerProps extends
  Pick<Incident, 'id' | 'impactedStart' | 'impactedEnd'> {
  impactedCount: number
  visible: boolean
  onClose: () => void
}
export interface ImpactedClientsDrawerProps extends ImpactedDrawerProps {
  startTime: string
  endTime: string
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
  osType: string[]
}

export function column <RecordType> (
  column: keyof RecordType,
  columnProps: Partial<ColumnType<RecordType>> = {}
): TableColumn<RecordType> {
  const { $t, formatList } = getIntl()

  function sorter (a: RecordType, b: RecordType) {
    const dataA = a[column] as unknown as RecordType[keyof RecordType][]
    const dataB = b[column] as unknown as RecordType[keyof RecordType][]
    return dataA[0] > dataB[0]? 1 : -1
  }

  function render (
    _: React.ReactNode,
    row: RecordType,
    __: number,
    highlightFn: TableHighlightFnArgs
  ) {
    const data = row[column] as unknown as string[]
    const text = $t(
      {
        defaultMessage: '{name}{count, plural, one {} other { ({count})}}',
        description: 'Translation strings - nil)'
      },
      { name: data[0], count: data.length }
    )
    return <span
      title={formatList(data, { style: 'narrow', type: 'conjunction' })}
    >{columnProps.searchable ? highlightFn(text) : text}</span>
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

const titleText =
  '{count} Impacted {count, plural, one {Client} other {Clients}}' +
  '{isLimited, select, true { (showing 500 of {totalCount} clients)} other {}}'

export const ImpactedClientsDrawer: React.FC<ImpactedClientsDrawerProps> = (props) => {
  const { $t, formatList } = useIntl()
  const [ search, setSearch ] = useState('')
  const queryResults = useImpactedClientsQuery({
    id: props.id,
    search,
    n: 500,
    impactedStart: props.impactedStart,
    impactedEnd: props.impactedEnd
  }, { selectFromResult: (states) => ({
    ...states,
    data: states.data && aggregateDataBy<ImpactedClient>('mac')(states.data)
  }) })
  const { startTime, endTime } = props
  const period = encodeParameter<DateFilter>({
    startDate: startTime,
    endDate: endTime,
    range: DateRange.custom
  })
  const columns = useMemo(() => [
    column('hostname', {
      title: $t({ defaultMessage: 'Hostname' }),
      tooltip: tooltips.hostname,
      render: (_, { mac, hostname }) =>
        <TenantLink
          to={`/users/wifi/clients/${mac}/details/troubleshooting?period=${period}`}
          title={formatList(hostname, { style: 'narrow', type: 'conjunction' })}
        >{$t(
            {
              defaultMessage: '{hostname}{count, plural, one {} other { ({count})}}',
              description: 'Translation strings - nil)'
            },
            { hostname: hostname[0], count: hostname.length }
          )}
        </TenantLink>
    }),
    column('mac', {
      title: $t({ defaultMessage: 'MAC Address' }),
      searchable: true
    }),
    column('username', {
      title: $t({ defaultMessage: 'Username' }),
      tooltip: tooltips.username
    }),
    column('manufacturer', {
      title: $t({ defaultMessage: 'Manufacturer' }),
      searchable: true
    }),
    column('osType', { title: $t({ defaultMessage: 'OS Type' }) }),
    column('ssid', {
      title: $t({ defaultMessage: 'Network' }),
      searchable: true
    })
  ] as TableColumn<AggregatedImpactedClient>[], [$t, period, formatList])

  return <Drawer
    width={'800px'}
    title={$t(
      {
        defaultMessage: titleText,
        description: 'Translation strings - Impacted, Client, Clients with optional limit indicator'
      },
      {
        count: props.impactedCount,
        isLimited: props.impactedCount > 500 ? 'true' : 'false',
        totalCount: props.impactedCount
      }
    )}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <Table<AggregatedImpactedClient>
        rowKey='mac'
        columns={columns}
        onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
        searchableWidth={370}
        enableApiFilter
        dataSource={queryResults.data}
      />
    </Loader>}
  />
}

export const ImpactedAPsDrawer: React.FC<ImpactedDrawerProps> = (props) => {
  const { $t, formatList } = useIntl()
  const [ search, setSearch ] = useState('')
  const queryResults = useImpactedAPsQuery({
    id: props.id,
    search,
    n: 100,
    impactedStart: props.impactedStart,
    impactedEnd: props.impactedEnd
  },{ selectFromResult: (states) => ({
    ...states,
    data: states.data && aggregateDataBy<ImpactedAP>('mac')(states.data)
  }) })

  const columns = useMemo(() => [
    column('name', {
      title: $t({ defaultMessage: 'AP Name' }),
      searchable: true,
      render: (_, { name, mac }, __, highlightFn) =>
        <TenantLink
          to={`devices/wifi/${mac}/details/${get('IS_MLISA_SA') ? 'ai': 'overview'}`}
          title={formatList(name, { style: 'narrow', type: 'conjunction' })}
        >{highlightFn($t(
            {
              defaultMessage: '{name}{count, plural, one {} other { ({count})}}',
              description: 'Translation strings - nil)'
            },
            { name: name[0], count: name.length }
          ))}
        </TenantLink>
    }),
    column('model', {
      title: $t({ defaultMessage: 'Model' }),
      searchable: true
    }),
    column('mac', {
      title: $t({ defaultMessage: 'MAC Address' }),
      searchable: true
    }),
    column('version', {
      title: $t({ defaultMessage: 'Version' }),
      searchable: true
    })
  ] as TableColumn<AggregatedImpactedAP>[], [$t, formatList])

  return <Drawer
    width={'600px'}
    title={$t(
      {
        defaultMessage: '{count} Impacted {count, plural, one {AP} other {APs}}',
        description: 'Translation strings - Impacted, AP, APs)'
      },
      { count: props.impactedCount }
    )}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <Table<AggregatedImpactedAP>
        rowKey='mac'
        columns={columns}
        onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
        searchableWidth={390}
        enableApiFilter
        dataSource={queryResults.data}/>
    </Loader>}
  />
}
