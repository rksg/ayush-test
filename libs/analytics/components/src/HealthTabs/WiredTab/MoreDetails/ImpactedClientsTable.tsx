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
  WidgetType, PieChartResult, SwitchDetails,
  showTopResult, topImpactedSwitchesLimit,
  ImpactedClientsResult
} from './config'
import {
  usePieChartDataQuery,
  useImpactedClientsDataQuery,
  wiredDevicesQueryMapping,
  fieldsMap,
  topNQueryMapping }              from './services'
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

  const { data: impactedSwitches } = usePieChartDataQuery({
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
  console.log('impactedSwitches', impactedSwitches)

  const queryResults = useImpactedClientsDataQuery({
    ...payload,
    type: queryType,
    switchIds: impactedSwitches?.map(s => s.mac)
  }, {
    skip: impactedSwitches?.length === 0,
    selectFromResult: ({ data, ...rest }) => {
      return {
        data: pickWiredDevicesData(data!, queryType),
        ...rest
      }
    }
  })
  console.log('useImpactedClientsDataQuery', queryResults?.data)

  // const metricTableColLabelMapping: Record<Exclude<WidgetType,
  //   'congestion' | 'portStorm'>, string> = {
  //     cpuUsage: $t({ defaultMessage: 'CPU Usage' }),
  //     dhcpFailure: $t({ defaultMessage: 'DHCP Failure Count' })
  //   }

  const metricField = fieldsMap[queryType as keyof typeof fieldsMap]
  // const columns: TableProps<SwitchDetails>['columns'] = [
  //   {
  //     title: $t({ defaultMessage: 'Name' }),
  //     dataIndex: 'name',
  //     key: 'name',
  //     render: (_, row: SwitchDetails) => (
  //       <TenantLink to={`/devices/switch/${row.mac}/serial/details/incidents`}>
  //         {row.name}
  //       </TenantLink>
  //     ),
  //     sorter: { compare: sortProp('name', defaultSort) }
  //   },
  //   {
  //     title: $t({ defaultMessage: 'MAC Address' }),
  //     dataIndex: 'mac',
  //     key: 'mac',
  //     sorter: { compare: sortProp('mac', defaultSort) }
  //   },
  //   {
  //     title: $t({ defaultMessage: 'Serial' }),
  //     dataIndex: 'serial',
  //     key: 'serial',
  //     sorter: { compare: sortProp('serial', defaultSort) }
  //   },
  //   {
  //     title: $t({ defaultMessage: 'Model' }),
  //     dataIndex: 'model',
  //     key: 'model',
  //     sorter: { compare: sortProp('model', defaultSort) }
  //   },
  //   {
  //     title: $t({ defaultMessage: 'Status' }),
  //     dataIndex: 'status',
  //     key: 'status',
  //     sorter: { compare: sortProp('status', defaultSort) }
  //   },
  //   {
  //     title: $t({ defaultMessage: 'Firmware' }),
  //     dataIndex: 'firmware',
  //     key: 'firmware',
  //     sorter: { compare: sortProp('firmware', defaultSort) }
  //   },
  //   {
  //     title: metricTableColLabelMapping[queryType as keyof typeof metricTableColLabelMapping],
  //     dataIndex: metricField,
  //     key: metricField,
  //     sorter: { compare: sortProp(metricField, defaultSort) }
  //   }
  // ]

  // const totalCount = queryResults?.data?.length
  return (
  //   <Loader states={[queryResults]}>
  //     <ChartTitle>
  //       <FormattedMessage
  //         defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
  //           one {Switch}
  //           other {Switches}
  //         }`}
  //         values={{
  //           count: showTopResult($t, totalCount, topImpactedSwitchesLimit),
  //           totalCount,
  //           b: (chunk) => <b>{chunk}</b>
  //         }}
  //       />
  //     </ChartTitle>
  //     <Table
  //       columns={columns}
  //       dataSource={queryResults.data}
  //       rowKey='mac'
  //       type='compactBordered'
  //     />
  //   </Loader>
    <div>TODO</div>
  )
}
