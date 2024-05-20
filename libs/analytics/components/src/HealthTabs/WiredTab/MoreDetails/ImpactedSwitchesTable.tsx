import { useIntl } from 'react-intl'

import { sortProp, defaultSort  } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { TenantLink }           from '@acx-ui/react-router-dom'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { useImpactedSwitchesDataQuery, SwitchDetails, WidgetType, PieChartResult } from './services'

export const ImpactedSwitchesTable = ({
  filters,
  queryType
}: {
  filters: AnalyticsFilter;
  queryType: WidgetType['type'];
}) => {
  const { $t } = useIntl()

  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const getTableData = (data: PieChartResult, type: WidgetType['type']) => {
    if (!data) return []

    switch(type){
      case 'cpuUsage':
        return data.topNSwitchesByCpuUsage
      case 'dhcpFailure':
        return data.topNSwitchesByDhcpFailure
      default:
        return []
    }
  }
  const queryResults = useImpactedSwitchesDataQuery(
    {
      ...payload,
      type: queryType,
      n: 10
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

  const columns: TableProps<SwitchDetails>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (_, row: SwitchDetails) => (
        <TenantLink to={`/devices/switch/${row.mac}/serial/details/incidents`}>
          {row.name}
        </TenantLink>
      ),
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
      title: $t({ defaultMessage: 'No. Of Ports' }),
      dataIndex: 'numOfPorts',
      key: 'numOfPorts',
      sorter: { compare: sortProp('numOfPorts', defaultSort) }
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columns}
        dataSource={queryResults.data}
        rowKey='id'
        type='compactBordered'
      />
    </Loader>
  )
}
