import { useIntl, FormattedMessage } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { TenantLink }           from '@acx-ui/react-router-dom'
import type { AnalyticsFilter } from '@acx-ui/utils'

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

  const columns: TableProps<ImpactedClients>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: '1',
      render: (_, row: ImpactedClients) => (
        <TenantLink to={`/devices/switch/${row.switchId}/serial/details/incidents`}>
          {row.switchName}
        </TenantLink>
      ),
      disable: true,
      fixed: 'left',
      sorter: { compare: sortProp('switchName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Local Port' }),
      dataIndex: 'localPortName',
      key: '2',
      fixed: 'left',
      disable: true,
      sorter: { compare: sortProp('localPortName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'deviceName',
      key: '3',
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device MAC' }),
      dataIndex: 'deviceMac',
      key: '4',
      sorter: { compare: sortProp('deviceMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port' }),
      dataIndex: 'devicePort',
      key: '5',
      show: false,
      sorter: { compare: sortProp('devicePort', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port MAC' }),
      dataIndex: 'devicePortMac',
      key: '6',
      width: 150,
      show: false,
      sorter: { compare: sortProp('devicePortMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port Type' }),
      dataIndex: 'devicePortType',
      width: 150,
      key: '7',
      sorter: { compare: sortProp('devicePortType', defaultSort) }
    }
  ]

  const totalCount = impactedClients?.data?.length
  return (
    <Loader states={[impactedClients, impactedSwitches]}>
      <ChartTitle>
        <FormattedMessage
          defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
            one {Device}
            other {Devices}
          }`}
          values={{
            count: showTopResult($t, totalCount, topImpactedSwitchesLimit),
            totalCount,
            b: (chunk) => <b>{chunk}</b>
          }}
        />
      </ChartTitle>
      <Table
        settingsId='switch-health-impacted-devices-table'
        columns={columns}
        dataSource={impactedClients.data}
        rowKey='deviceMac'
        type='tall'
      />
    </Loader>
  )
}
