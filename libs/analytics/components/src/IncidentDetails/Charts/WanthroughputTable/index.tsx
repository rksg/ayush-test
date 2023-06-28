import React, { useMemo } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { DateFormatEnum, formatter }       from '@acx-ui/formatter'
import { TenantLink }                      from '@acx-ui/react-router-dom'

import { useWanthroughputTableQuery, ImpactedAP } from './services'

import type { ChartProps } from '../types.d'

export const WanthroughputTable: React.FC<ChartProps> = (props) => {
  const { $t } = useIntl()

  const queryResults = useWanthroughputTableQuery({ id: props.incident.id })

  const columnHeaders: TableProps<ImpactedAP>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, { name, mac }, __, highlightFn) =>
        <TenantLink to={`devices/wifi/${mac}/details/overview`}>{highlightFn(name)}</TenantLink>,
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
      render: (_, value) =>
        formatter(DateFormatEnum.DateTimeFormat)(value.eventTime),
      sorter: { compare: sortProp('eventTime', dateSort) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'sliceType' are not changing

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Impacted APs' })} type='no-border'>
        <Table
          type='tall'
          dataSource={queryResults.data}
          columns={columnHeaders}
        />
      </Card>
    </Loader>
  )
}

export default WanthroughputTable
