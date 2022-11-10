import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { noDataSymbol }              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { TenantLink }                from '@acx-ui/react-router-dom'

import { ImpactedTableProps, defaultSort } from '../utils'

import { poeApPwrModeEnumMap }             from './poeApPwrModeEnumMap'
import { poeCurPwrSrcEnumMap }             from './poeCurPwrSrcEnumMap'
import { ImpactedAP, usePoeLowTableQuery } from './services'

export type PoeLowTableFields = {
  name: string
  mac: string
  configured: string
  operating: string
  eventTime: number
  apGroup: string
  key: string
}

export const PoeLowTable: React.FC<ImpactedTableProps> = (props) => {
  const { $t } = useIntl()
  const [ search ] = useState('')

  const queryResults = usePoeLowTableQuery({
    id: props.incident.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states
  }) })

  const convertData = (data?: ImpactedAP[]) => (
    data!.map(datum => {
      const configured = datum.poeMode.configured
      const operating = datum.poeMode.operating
      return {
        name: datum.name,
        mac: datum.mac,
        configured: $t(poeApPwrModeEnumMap[configured as keyof typeof poeApPwrModeEnumMap]),
        operating: $t(poeCurPwrSrcEnumMap[operating as keyof typeof poeCurPwrSrcEnumMap]),
        eventTime: datum.poeMode.eventTime,
        apGroup: datum.poeMode.apGroup,
        key: datum.poeMode.eventTime + datum.name
      }
    })
  )

  const columnHeaders: TableProps<PoeLowTableFields>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, value) => <TenantLink to={'TDB'}>{value.name}</TenantLink>,
      sorter: {
        compare: (a, b) => defaultSort(a.name, b.name)
      },
      defaultSortOrder: 'descend',
      fixed: 'left',
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
          compare: (a: { apGroup: string }, b: { apGroup: string } ) =>
            defaultSort(a.apGroup as string, b.apGroup as string)
        },
        searchable: true
      }]
      : []),
    {
      title: $t(defineMessage({ defaultMessage: 'Configured PoE Mode' })),
      width: 120,
      dataIndex: 'configured',
      key: 'configured',
      sorter: {
        compare: (a, b) => defaultSort(a.configured, b.configured)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Operating PoE Mode' })),
      width: 120,
      dataIndex: 'operating',
      key: 'operating',
      sorter: {
        compare: (a, b) => defaultSort(a.operating, b.operating)
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
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' 'sliceType' are not changing

  return (
    <Loader states={[queryResults]}>
      {queryResults.data &&
        <Table
          type='tall'
          dataSource={convertData(queryResults.data)}
          columns={columnHeaders}
          columnEmptyText={noDataSymbol}
        />
      }
    </Loader>
  )
}

export default PoeLowTable
