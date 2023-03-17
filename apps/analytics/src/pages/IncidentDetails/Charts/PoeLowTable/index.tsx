import React, { useMemo } from 'react'

import { useIntl, defineMessage, IntlShape } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { DateFormatEnum, formatter }       from '@acx-ui/formatter'
import { TenantLink }                      from '@acx-ui/react-router-dom'

import { usePoeLowTableQuery, ImpactedAP } from './services'

import type { ChartProps } from '../types.d'

const configuredPoEModeMapping = ($t: IntlShape['$t']) => [
  { key: 'RKS_AP_PWR_MODE_AUTO', value: $t({ defaultMessage: 'Auto' }) },
  { key: 'RKS_AP_PWR_MODE_AF', value: $t({ defaultMessage: '802.3af' }) },
  { key: 'RKS_AP_PWR_MODE_AT', value: $t({ defaultMessage: '802.3at' }) },
  { key: 'RKS_AP_PWR_MODE_AT_PLUS', value: $t({ defaultMessage: '802.3at+' }) },
  { key: 'RKS_AP_PWR_MODE_BT6', value: $t({ defaultMessage: '802.3bt/Class 6' }) },
  { key: 'RKS_AP_PWR_MODE_BT7', value: $t({ defaultMessage: '802.3bt/Class 7' }) },
  { key: 'RKS_AP_PWR_MODE_BT8', value: $t({ defaultMessage: '802.3bt/Class 8' }) },
  { key: 'RKS_AP_PWR_MODE_MAX', value: $t({ defaultMessage: 'Max' }) }
]

const operatingPoEModeMapping = ($t: IntlShape['$t']) => [
  { key: 'RKS_AP_PWR_SRC_UNKNOWN', value: $t({ defaultMessage: 'Unknown' }) },
  { key: 'RKS_AP_PWR_SRC_DC', value: $t({ defaultMessage: 'AC/DC Power supply' }) },
  { key: 'RKS_AP_PWR_SRC_AT', value: $t({ defaultMessage: '802.3at Switch/Injector' }) },
  { key: 'RKS_AP_PWR_SRC_INJ', value: $t({ defaultMessage: 'PoE Injector' }) },
  { key: 'RKS_AP_PWR_SRC_AF', value: $t({ defaultMessage: '802.3af Switch/Injector' }) },
  { key: 'RKS_AP_PWR_SRC_AT_PLUS', value: $t({ defaultMessage: '802.3at+ Switch/Injector' }) },
  { key: 'RKS_AP_PWR_SRC_BT6', value: $t({ defaultMessage: '802.3bt/Class 6' }) },
  { key: 'RKS_AP_PWR_SRC_BT7', value: $t({ defaultMessage: '802.3bt/Class 7' }) },
  { key: 'RKS_AP_PWR_SRC_BT8', value: $t({ defaultMessage: '802.3bt/Class 8' }) }
]

export const PoeLowTable: React.FC<ChartProps> = (props) => {
  const { $t } = useIntl()

  const queryResults = usePoeLowTableQuery({ id: props.incident.id })

  const columnHeaders: TableProps<ImpactedAP>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, { mac, name }, __, highlightFn) =>
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
      title: $t(defineMessage({ defaultMessage: 'Configured PoE Mode' })),
      dataIndex: 'configured',
      key: 'configured',
      sorter: { compare: sortProp('configured', defaultSort) },
      filterable: configuredPoEModeMapping($t)
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Operating PoE Mode' })),
      dataIndex: 'operating',
      key: 'operating',
      sorter: { compare: sortProp('operating', defaultSort) },
      filterable: operatingPoEModeMapping($t)
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

export default PoeLowTable
