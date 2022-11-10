import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { TenantLink }                      from '@acx-ui/react-router-dom'

import { ImpactedTableProps, sortedColumn } from '../utils'

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
    sortedColumn('name', {
      title: $t(defineMessage({ defaultMessage: 'Switch Name' })),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, value: PoePdTableFields) => <TenantLink to={'TDB'}>{value.name}</TenantLink>,
      defaultSortOrder: 'descend',
      fixed: 'left',
      searchable: true
    }),
    sortedColumn('mac', {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      width: 110,
      dataIndex: 'mac',
      key: 'mac',
      searchable: true
    }),
    sortedColumn('portNumber', {
      title: $t(defineMessage({ defaultMessage: 'Port Number' })),
      width: 130,
      dataIndex: 'portNumber',
      key: 'portNumber',
      filterable: true
    }),
    sortedColumn('eventTime', {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      width: 100,
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: PoePdTableFields) => moment(value.eventTime).format('MMMM DD YYYY HH:mm')
    }) // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' are not changing

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
