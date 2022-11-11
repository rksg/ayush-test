import React, { useMemo, useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { TenantLink }                      from '@acx-ui/react-router-dom'
import { formatter }                       from '@acx-ui/utils'

import { ImpactedTableProps } from '../types.d'

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
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, value: PoeLowTableFields) => <TenantLink to={'TDB'}>{value.name}</TenantLink>,
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
      title: $t(defineMessage({ defaultMessage: 'Configured PoE Mode' })),
      dataIndex: 'configured',
      key: 'configured',
      sorter: { compare: sortProp('configured', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Operating PoE Mode' })),
      dataIndex: 'operating',
      key: 'operating',
      sorter: { compare: sortProp('operating', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value: PoeLowTableFields) =>
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
            dataSource={convertData(queryResults.data)}
            columns={columnHeaders}
          />
        </Card>
      }
    </Loader>
  )
}

export default PoeLowTable
