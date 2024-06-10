import { useIntl, FormattedMessage } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { formatter, FormatterType } from '@acx-ui/formatter'
import { TenantLink }               from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }     from '@acx-ui/utils'

import {
  WidgetType, PieChartResult,
  showTopResult, topImpactedSwitchesLimit,
  ImpactedClientsResult, ImpactedClients
} from './config'
import {
  usePieChartDataQuery,
  useImpactedClientsDataQuery,
  wiredDevicesQueryMapping,
  topNQueryMapping
} from './services'
import { ChartTitle } from './styledComponents'

export const ImpactedClientsTable = ({
  filters,
  queryType
}: {
  filters: AnalyticsFilter;
  queryType: WidgetType;
}) => {
  const { $t } = useIntl()

  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const pickTopNData = (data: PieChartResult, type: WidgetType) => {
    if (!data) return []
    return data[topNQueryMapping[type] as keyof PieChartResult]
  }

  const pickWiredDevicesData = (data: ImpactedClientsResult, type: WidgetType) => {
    if (!data) return []
    return data[wiredDevicesQueryMapping[type] as keyof ImpactedClientsResult]
  }

  const metricTableColLabelMapping: Record<Exclude<WidgetType, 'cpuUsage' | 'dhcpFailure'>, {
    title: string
    formatterType: FormatterType
  }> = {
    congestion: {
      title: $t({ defaultMessage: 'Out Utilization' }),
      formatterType: 'percentFormat'
    },
    portStorm: {
      title: $t({ defaultMessage: 'Multicast Pkt Count' }),
      formatterType: 'countFormat'
    }
  }

  // Get the list of impacted switches
  const impactedSwitches = usePieChartDataQuery({
    ...payload,
    type: queryType,
    n: topImpactedSwitchesLimit
  }, {
    selectFromResult: (result) => {
      const { data, ...rest } = result
      return {
        data: pickTopNData(data!, queryType),
        ...rest
      }
    }
  })

  const impactedClients = useImpactedClientsDataQuery({
    ...payload,
    type: queryType,
    switchIds: impactedSwitches.data?.map(s => s.mac)
  }, {
    skip: impactedSwitches.data?.length === 0,
    selectFromResult: ({ data, ...rest }) => {
      return {
        data: pickWiredDevicesData(data!, queryType),
        ...rest
      }
    }
  })

  const {
    title: metricTitle,
    formatterType
  } = metricTableColLabelMapping[queryType as keyof typeof metricTableColLabelMapping]

  const columns: TableProps<ImpactedClients>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: 'switchName',
      render: (_, row: ImpactedClients) => (
        <TenantLink to={`/devices/switch/${row.switchId}/serial/details/incidents`}>
          {row.switchName}
        </TenantLink>
      ),
      sorter: { compare: sortProp('switchName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Switch MAC' }),
      dataIndex: 'switchId',
      key: 'switchId',
      sorter: { compare: sortProp('switchId', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'deviceName',
      key: 'deviceName',
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'deviceMac',
      key: 'deviceMac',
      sorter: { compare: sortProp('deviceMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Name' }),
      dataIndex: 'devicePort',
      key: 'devicePort',
      sorter: { compare: sortProp('devicePort', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Local Port Name' }),
      dataIndex: 'localPortName',
      key: 'localPortName',
      sorter: { compare: sortProp('localPortName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port MAC' }),
      dataIndex: 'devicePortMac',
      key: 'devicePortMac',
      sorter: { compare: sortProp('devicePortMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      dataIndex: 'devicePortType',
      key: 'devicePortType',
      sorter: { compare: sortProp('devicePortType', defaultSort) }
    },
    {
      title: metricTitle,
      dataIndex: 'metricValue',
      key: 'metricValue',
      sorter: { compare: sortProp('metricValue', defaultSort) },
      render: (_, { metricValue }) => {
        return formatter(formatterType)(
          formatterType === 'percentFormat' ? (metricValue as number/100) : metricValue)
      }
    }
  ]

  const totalCount = impactedClients?.data?.length
  return (
    <Loader states={[impactedClients, impactedSwitches]}>
      <ChartTitle>
        <FormattedMessage
          defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
            one {Client}
            other {Clients}
          }`}
          values={{
            count: showTopResult($t, totalCount, topImpactedSwitchesLimit),
            totalCount,
            b: (chunk) => <b>{chunk}</b>
          }}
        />
      </ChartTitle>
      <Table
        settingsId='switch-health-impacted-clients-table'
        columns={columns}
        dataSource={impactedClients.data}
        rowKey='deviceMac'
        type='tall'
      />
    </Loader>
  )
}
