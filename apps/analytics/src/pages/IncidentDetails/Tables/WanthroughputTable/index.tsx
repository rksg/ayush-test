import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { noDataSymbol }              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { useTenantLink, Link }       from '@acx-ui/react-router-dom'

import { ImpactedTableProps, defaultSort } from '../utils'

import { ImpactedAP, useImpactedEntitiesQuery } from './services'

type WanthroughputTableFields = {
  name: string
  mac: string
  interface: string
  capability: string
  link: string
  eventTime: number
  apGroup: string
}

export const WanthroughputTable: React.FC<ImpactedTableProps> = (props) => {
  const intl = useIntl()
  const { $t } = intl
  const [ search ] = useState('')

  const queryResults = useImpactedEntitiesQuery({
    id: props.incident.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states
  }) })
  const basePath = useTenantLink('/analytics/incidents/')

  const convertData = (data: ImpactedAP[]) => data.flatMap(datum =>
    datum.ports.flatMap(result => ({
      name: datum.name,
      mac: datum.mac,
      interface: result.interface,
      capability: result.capability,
      link: result.link,
      eventTime: result.eventTime,
      apGroup: result.apGroup
    }))
  )

  const columnHeaders: TableProps<WanthroughputTableFields>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      width: 200,
      dataIndex: 'apName',
      key: 'apName',
      render: (_, value) => {
        return <Link to={{ ...basePath, pathname: `${basePath.pathname}` }}>
          {value.name}
        </Link>
      },
      sorter: {
        compare: (a, b) => defaultSort(a.name, b.name)
      },
      defaultSortOrder: 'descend',
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      width: 120,
      dataIndex: 'mac',
      key: 'mac',
      sorter: {
        compare: (a, b) => defaultSort(a.mac, b.mac)
      },
      searchable: true
    },
    ...(props.incident.sliceType === 'zone'
      ? [{
        title: $t(defineMessage({ defaultMessage: 'AP Group' })),
        width: 110,
        dataIndex: 'apGroup',
        key: 'apGroup',
        sorter: {
          compare: (a: { apGroup: string }, b: { apGroup: string }) =>
            defaultSort(a.apGroup as string, b.apGroup as string)
        },
        searchable: true
      }]
      : []),
    {
      title: $t(defineMessage({ defaultMessage: 'Interface' })),
      width: 100,
      dataIndex: 'interface',
      key: 'interface',
      sorter: {
        compare: (a, b) => defaultSort(a.interface, b.interface)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'WAN Link Capability' })),
      width: 200,
      dataIndex: 'capability',
      key: 'capability',
      sorter: {
        compare: (a, b) => defaultSort(a.capability, b.capability)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'WAN Link' })),
      width: 200,
      dataIndex: 'link',
      key: 'link',
      sorter: {
        compare: (a, b) => defaultSort(a.link, b.link)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      width: 130,
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value) => moment(value.eventTime).format('MMMM DD YYYY HH:mm'),
      sorter: {
        compare: (a, b) => defaultSort(a.eventTime, b.eventTime)
      }
    }
  ], [])

  return (
    <Loader states={[queryResults]}>
      <Table
        type='tall'
        dataSource={convertData(queryResults.data!)}
        columns={columnHeaders}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
        indentSize={6}
      />
    </Loader>
  )
}

export default WanthroughputTable
