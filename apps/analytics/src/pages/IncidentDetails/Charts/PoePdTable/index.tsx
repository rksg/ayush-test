import React, { useMemo, useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { TenantLink }                      from '@acx-ui/react-router-dom'
import { formatter }                       from '@acx-ui/utils'

import { ImpactedTableProps } from '../types.d'

import { ImpactedSwitch, usePoePdTableQuery } from './services'

type PoePdTableFields = {
  name: string
  mac: string
  portNumber: string
  eventTime: number
  key: string
}

export const PoePdTable: React.FC<ImpactedTableProps> = (props) => {
  const { $t } = useIntl()
  const [ search ] = useState('')

  const queryResults = usePoePdTableQuery({
    id: props.incident.id,
    search,
    n: 100
  }, { selectFromResult: (states) => ({
    ...states
  }) })

  const convertData = (data: ImpactedSwitch[]) => data.flatMap(datum =>
    datum.ports.flatMap((result, index) => ({
      name: datum.name,
      mac: datum.mac,
      portNumber: result.portNumber,
      eventTime: Number((result.metadata.match(/(\d+)/))?.[0]),
      key: datum.name + index
    }))
  )

  const columnHeaders: TableProps<PoePdTableFields>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'Switch Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, value: PoePdTableFields) => <TenantLink to={'TDB'}>{value.name}</TenantLink>,
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
    {
      title: $t(defineMessage({ defaultMessage: 'Port Number' })),
      dataIndex: 'portNumber',
      key: 'portNumber',
      sorter: { compare: sortProp('portNumber', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: PoePdTableFields) =>
        formatter('dateTimeFormat')(value.eventTime),
      sorter: { compare: sortProp('eventTime', dateSort) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' is not changing

  return (
    <Loader states={[queryResults]}>
      {queryResults.data &&
        <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
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

export default PoePdTable
