import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { TenantLink }             from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }   from '@acx-ui/utils'

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
  const isMlisaVersion4110 = useIsSplitOn(Features.MLISA_4_11_0_TOGGLE)

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
    isMlisaVersion4110,
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

  const isMLISA = get('IS_MLISA_SA')
  const columns: TableProps<ImpactedClients>['columns'] = [
    {
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'switchName',
      key: 'switchName',
      render: (_, row: ImpactedClients) => {
        const switchId = isMLISA ? row.switchId : row.switchId?.toLowerCase()
        const detailsPath = isMLISA ? 'reports' : 'overview'
        const serial = isMLISA || !isMlisaVersion4110 ? 'serial' : row.switchSerial

        return (
          <TenantLink
            to={`/devices/switch/${switchId}/${serial}/details/${detailsPath}`}
          >
            {row.switchName}
          </TenantLink>
        )
      },
      sorter: { compare: sortProp('switchName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Local Port' }),
      dataIndex: 'localPortName',
      key: 'localPortName',
      sorter: { compare: sortProp('localPortName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Switch MAC' }),
      dataIndex: 'switchId',
      key: 'switchId',
      sorter: { compare: sortProp('switchId', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Peer Device Name' }),
      dataIndex: 'deviceName',
      key: 'deviceName',
      sorter: { compare: sortProp('deviceName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Peer Device MAC' }),
      dataIndex: 'deviceMac',
      key: 'deviceMac',
      sorter: { compare: sortProp('deviceMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Peer Device Port' }),
      dataIndex: 'devicePort',
      key: 'devicePort',
      sorter: { compare: sortProp('devicePort', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Peer Device Port MAC' }),
      dataIndex: 'devicePortMac',
      key: 'devicePortMac',
      sorter: { compare: sortProp('devicePortMac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Peer Device Port Type' }),
      dataIndex: 'devicePortType',
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
          {...(queryType === 'portStorm'
            ? defineMessage({ defaultMessage:
              '<b>{count}</b> Impacted Storm  {totalCount, plural, one {Port} other {Ports}}' })
            : defineMessage({ defaultMessage:
               '<b>{count}</b> Impacted Uplink  {totalCount, plural, one {Port} other {Ports}}' }))
          }
          values={{
            count: showTopNTableResult($t, totalCount, topImpactedSwitchesLimit),
            totalCount,
            b: (chunk) => <b>{chunk}</b>
          }}/>
      </ChartTitle>
      <Table<ImpactedClients>
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 10,
          total: totalCount
        }}
        rowKey='rowId'
        type='compactBordered'
      />
    </Loader>
  )
}
