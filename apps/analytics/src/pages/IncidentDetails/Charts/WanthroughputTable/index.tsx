import React, { useMemo, useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { TenantLink }                      from '@acx-ui/react-router-dom'
import { formatter }                       from '@acx-ui/utils'

import { ImpactedTableProps } from '../types.d'

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
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, value: WanthroughputTableFields) =>
        <TenantLink to={'TDB'}>{value.name}</TenantLink>,
      fixed: 'left',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      dataIndex: 'mac',
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) },
      searchable: true
    },
    ...(props.incident.sliceType === 'zone'
      ? [{
        title: $t(defineMessage({ defaultMessage: 'AP Group' })),
        dataIndex: 'apGroup',
        key: 'apGroup',
        sorter: { compare: sortProp('apGroup', defaultSort) },
        searchable: true
      }]
      : []),
    {
      title: $t(defineMessage({ defaultMessage: 'Interface' })),
      dataIndex: 'interface',
      key: 'interface',
      sorter: { compare: sortProp('interface', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'WAN Link Capability' })),
      dataIndex: 'capability',
      key: 'capability',
      sorter: { compare: sortProp('capability', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'WAN Link' })),
      dataIndex: 'link',
      key: 'link',
      sorter: { compare: sortProp('link', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: WanthroughputTableFields) =>
        formatter('dateTimeFormat')(value.eventTime),
      sorter: { compare: sortProp('eventTime', dateSort) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'sliceType' are not changing

  return (
    <Loader states={[queryResults]}>
      {queryResults.data &&
        <Card title={$t({ defaultMessage: 'Impacted APs' })} type='no-border'>
          <Table
            type='tall'
            dataSource={convertData(queryResults.data!)}
            columns={columnHeaders}
          />
        </Card>
      }
    </Loader>
  )
}

export default WanthroughputTable
