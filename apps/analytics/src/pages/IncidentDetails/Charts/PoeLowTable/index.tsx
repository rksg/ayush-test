import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { noDataSymbol }              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { TenantLink }                from '@acx-ui/react-router-dom'

import { ImpactedTableProps, sortedColumn } from '../utils'

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
    data!.map((datum, index) => {
      const configured = datum.poeMode.configured
      const operating = datum.poeMode.operating
      return {
        name: datum.name,
        mac: datum.mac,
        configured: $t(poeApPwrModeEnumMap[configured as keyof typeof poeApPwrModeEnumMap]),
        operating: $t(poeCurPwrSrcEnumMap[operating as keyof typeof poeCurPwrSrcEnumMap]),
        eventTime: datum.poeMode.eventTime,
        apGroup: datum.poeMode.apGroup,
        key: datum.name + index
      }
    })
  )

  const columnHeaders: TableProps<PoeLowTableFields>['columns'] = useMemo(() => [
    sortedColumn('name', {
      title: $t(defineMessage({ defaultMessage: 'AP Name1' })),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, value: PoeLowTableFields) => <TenantLink to={'TDB'}>{value.name}</TenantLink>,
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
      ? [sortedColumn<PoeLowTableFields>('apGroup', {
        title: $t(defineMessage({ defaultMessage: 'AP Group' })),
        width: 110,
        dataIndex: 'apGroup',
        key: 'apGroup',
        searchable: true
      })]
      : []),
    sortedColumn('configured', {
      title: $t(defineMessage({ defaultMessage: 'Configured PoE Mode' })),
      width: 120,
      dataIndex: 'configured',
      key: 'configured',
      filterable: true
    }),
    sortedColumn('operating', {
      title: $t(defineMessage({ defaultMessage: 'Operating PoE Mode' })),
      width: 120,
      dataIndex: 'operating',
      key: 'operating',
      filterable: true
    }),
    sortedColumn('eventTime', {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      width: 130,
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: PoeLowTableFields) => moment(value.eventTime).format('MMMM DD YYYY HH:mm')
    }) // eslint-disable-next-line react-hooks/exhaustive-deps
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
