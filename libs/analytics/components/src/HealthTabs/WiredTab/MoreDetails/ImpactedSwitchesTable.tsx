import { FormattedMessage, useIntl } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { get }                  from '@acx-ui/config'
import { formatter }            from '@acx-ui/formatter'
import { TenantLink }           from '@acx-ui/react-router-dom'
import type { AnalyticsFilter } from '@acx-ui/utils'

import {
  WidgetType, PieChartResult, SwitchDetails,
  showTopNTableResult, topImpactedSwitchesLimit
} from './config'
import { useImpactedSwitchesDataQuery, fieldsMap, topNQueryMapping } from './services'
import { ChartTitle }                                                from './styledComponents'

export const ImpactedSwitchesTable = ({
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
  const getTableData = (data: PieChartResult, type: WidgetType) => {
    if (!data) return []
    return (data[topNQueryMapping[type] as keyof PieChartResult] as Array<{ mac: string }>)
      .filter(({ mac }) => mac !== 'Others')
      .slice (0, topImpactedSwitchesLimit) as PieChartResult[keyof PieChartResult]
  }

  const queryResults = useImpactedSwitchesDataQuery(
    {
      ...payload,
      type: queryType,
      n: topImpactedSwitchesLimit + 1
    }, {
      selectFromResult: (result) => {
        const { data, ...rest } = result
        return {
          data: getTableData(data!, queryType),
          ...rest
        }
      }
    }
  )

  const metricTableColLabelMapping: Record<Exclude<WidgetType,
    'congestion' | 'portStorm'>, string> = {
      cpuUsage: $t({ defaultMessage: 'CPU Usage' }),
      dhcpFailure: $t({ defaultMessage: 'DHCP Failure Count' })
    }

  const metricField = fieldsMap[queryType as keyof typeof fieldsMap]
  const isMLISA = get('IS_MLISA_SA')
  const columns: TableProps<SwitchDetails>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (_, row: SwitchDetails) => {
        const macAddress = isMLISA ? row.mac : row.mac?.toLowerCase()
        const detailsPath = isMLISA ? 'reports' : 'overview'
        const serial = isMLISA ? 'serial' : row.serial
        return (
          <TenantLink to={`/devices/switch/${macAddress}/${serial}/details/${detailsPath}`}>
            {row.name}
          </TenantLink>
        )
      },
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Serial' }),
      dataIndex: 'serial',
      key: 'serial',
      sorter: { compare: sortProp('serial', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      key: 'model',
      sorter: { compare: sortProp('model', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: { compare: sortProp('status', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Firmware' }),
      dataIndex: 'firmware',
      key: 'firmware',
      sorter: { compare: sortProp('firmware', defaultSort) }
    },
    {
      title: metricTableColLabelMapping[queryType as keyof typeof metricTableColLabelMapping],
      dataIndex: metricField,
      key: metricField,
      sorter: { compare: sortProp(metricField, defaultSort) },
      render: (_, row) => {
        return formatter('countFormat')(row[metricField as keyof SwitchDetails])
      }
    }
  ]

  const totalCount = queryResults?.data?.length
  const data = queryResults?.data?.map((item, i) => ({
    ...item,
    rowId: i + 1
  }))

  return (
    <Loader states={[queryResults]}>
      <ChartTitle>
        <FormattedMessage
          defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
            one {Switch}
            other {Switches}
          }`}
          values={{
            count: showTopNTableResult($t, totalCount, topImpactedSwitchesLimit),
            totalCount,
            b: (chunk) => <b>{chunk}</b>
          }}
        />
      </ChartTitle>
      <Table
        columns={columns}
        dataSource={data as SwitchDetails[]}
        rowKey='rowId'
        type='compactBordered'
      />
    </Loader>
  )
}
