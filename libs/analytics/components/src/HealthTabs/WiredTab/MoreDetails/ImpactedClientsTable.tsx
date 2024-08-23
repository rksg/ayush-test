import { useIntl, FormattedMessage } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { get }                  from '@acx-ui/config'
import { TenantLink }           from '@acx-ui/react-router-dom'
import type { AnalyticsFilter } from '@acx-ui/utils'

import {
  WidgetType, PieChartResult,
  showTopNTableResult, topImpactedSwitchesLimit,
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
    n: 5
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
      key: 'switchName',
      render: (_, row: ImpactedClients) => (
        <TenantLink
          to={`/devices/switch/${row.switchId?.toLowerCase()}/serial/details/${get('IS_MLISA_SA')
            ? 'reports': 'overview'}`
          }>
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
      key: 'localPortName',
      fixed: 'left',
      width: 160,
      disable: true,
      sorter: { compare: sortProp('localPortName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Switch MAC' }),
      dataIndex: 'switchId',
      key: 'switchId',
      show: false,
      sorter: { compare: sortProp('switchId', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'deviceName',
      key: 'deviceName',
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device MAC' }),
      dataIndex: 'deviceMac',
      key: 'deviceMac',
      sorter: { compare: sortProp('deviceMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port' }),
      dataIndex: 'devicePort',
      key: 'devicePort',
      width: 160,
      show: false,
      sorter: { compare: sortProp('devicePort', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port MAC' }),
      dataIndex: 'devicePortMac',
      key: 'devicePortMac',
      width: 150,
      show: false,
      sorter: { compare: sortProp('devicePortMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Device Port Type' }),
      dataIndex: 'devicePortType',
      width: 150,
      key: 'devicePortType',
      sorter: { compare: sortProp('devicePortType', defaultSort) }
    }
  ]

  const totalCount = impactedClients?.data?.length
  const data = impactedClients?.data?.map((item: ImpactedClients, i) => ({
    ...item,
    rowId: i+1 // added to make rowKey unique
  }))

  return (
    <Loader states={[impactedClients, impactedSwitches]}>
      <ChartTitle>
        <FormattedMessage
          defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
            one {Uplink Port}
            other {Uplink Ports}
          }`}
          values={{
            count: showTopNTableResult($t, totalCount, topImpactedSwitchesLimit),
            totalCount,
            b: (chunk) => <b>{chunk}</b>
          }}
        />
      </ChartTitle>
      <Table<ImpactedClients>
        settingsId='switch-health-impacted-devices-table'
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 10,
          total: totalCount
        }}
        rowKey='rowId'
        type='tall'
      />
    </Loader>
  )
}
