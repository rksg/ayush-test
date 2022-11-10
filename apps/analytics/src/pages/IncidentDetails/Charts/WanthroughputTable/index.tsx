import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { noDataSymbol }              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { TenantLink }                from '@acx-ui/react-router-dom'

import { ImpactedTableProps, sortedColumn } from '../utils'

import { ImpactedAP, useWanthroughputTableQuery } from './services'

type WanthroughputTableFields = {
  name: string
  mac: string
  interface: string
  capability: string
  link: string
  eventTime: number
  apGroup: string
  key: string
}

export const WanthroughputTable: React.FC<ImpactedTableProps> = (props) => {
  const { $t } = useIntl()
  const [ search ] = useState('')

  const queryResults = useWanthroughputTableQuery({
    id: props.incident.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states
  }) })

  const convertData = (data: ImpactedAP[]) => data.flatMap(datum =>
    datum.ports.flatMap((result, index) => ({
      name: datum.name,
      mac: datum.mac,
      interface: result.interface,
      capability: result.capability,
      link: result.link,
      eventTime: result.eventTime,
      apGroup: result.apGroup,
      key: datum.name + index
    }))
  )

  const columnHeaders: TableProps<WanthroughputTableFields>['columns'] = useMemo(() => [
    sortedColumn('name', {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, value: WanthroughputTableFields) =>
        <TenantLink to={'TDB'}>{value.name}</TenantLink>,
      defaultSortOrder: 'descend',
      fixed: 'left',
      searchable: true
    }),
    sortedColumn('mac', {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      width: 120,
      dataIndex: 'mac',
      key: 'mac',
      searchable: true
    }),
    ...(props.incident.sliceType === 'zone'
      ? [sortedColumn<WanthroughputTableFields>('apGroup', {
        title: $t(defineMessage({ defaultMessage: 'AP Group' })),
        width: 110,
        dataIndex: 'apGroup',
        key: 'apGroup',
        searchable: true
      })]
      : []),
    sortedColumn('interface', {
      title: $t(defineMessage({ defaultMessage: 'Interface' })),
      width: 100,
      dataIndex: 'interface',
      key: 'interface',
      filterable: true
    }),
    sortedColumn('capability', {
      title: $t(defineMessage({ defaultMessage: 'WAN Link Capability' })),
      width: 200,
      dataIndex: 'capability',
      key: 'capability',
      filterable: true
    }),
    sortedColumn('link', {
      title: $t(defineMessage({ defaultMessage: 'WAN Link' })),
      width: 200,
      dataIndex: 'link',
      key: 'link',
      filterable: true
    }),
    sortedColumn('eventTime', {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      width: 130,
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: WanthroughputTableFields) =>
        moment(value.eventTime).format('MMMM DD YYYY HH:mm')
    }) // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' 'sliceType' are not changing

  return (
    <Loader states={[queryResults]}>
      {queryResults.data &&
        <Table
          type='tall'
          dataSource={convertData(queryResults.data!)}
          columns={columnHeaders}
          columnEmptyText={noDataSymbol}
        />
      }
    </Loader>
  )
}

export default WanthroughputTable
