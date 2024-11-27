import { useIntl } from 'react-intl'

import { sortProp, defaultSort, aggregateDataBy } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { TenantLink }             from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }   from '@acx-ui/utils'

import {
  Stages,
  stageLabels,
  showTopNPieChartResult,
  DrilldownSelection,
  topImpactedClientLimit,
  stageNameToCodeMap
} from './config'
import { PieChartData, TabKeyType }                      from './healthPieChart'
import { useHealthImpactedClientsQuery, ImpactedClient } from './services'
import { TableHeading }                                  from './styledComponents'

export const ImpactedClientsTable = ({
  filters,
  selectedStage,
  drillDownSelection,
  pieFilter,
  chartKey,
  pieList
}: {
  filters: AnalyticsFilter;
  selectedStage: Stages;
  drillDownSelection: DrilldownSelection;
  pieFilter: PieChartData | null;
  chartKey: TabKeyType;
  pieList: PieChartData[];
}) => {
  const { $t } = useIntl()
  const allowedPieFilter = [
    useIsSplitOn(Features.MLISA_4_11_0_TOGGLE),
    get('IS_MLISA_SA')
  ].some(Boolean)
  const filteredData = pieList?.map((data: PieChartData) => data.rawKey)
    .filter((rawKey: string) => rawKey !== 'Others')
  const fieldMap = {
    connectionFailure: 'topNImpactedClientbyConnFailure',
    ttc: 'topNImpactedClientbyAvgTTC'
  }
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const field = fieldMap?.[drillDownSelection as keyof typeof fieldMap]
  const pieData = {
    key: pieFilter?.rawKey ?? '',
    chartKey: chartKey,
    list: filteredData
  }
  const queryResults = useHealthImpactedClientsQuery(
    {
      ...payload,
      field: field,
      stage: (selectedStage && stageNameToCodeMap[selectedStage]) as string,
      topImpactedClientLimit: topImpactedClientLimit,
      pieData: pieFilter ? pieData : null,
      allowedPieFilter
    },
    {
      selectFromResult: (result) => {
        const { data, ...rest } = result
        return {
          data:
            data?.network?.hierarchyNode?.impactedClients &&
            aggregateDataBy<ImpactedClient>('mac')(
              data?.network?.hierarchyNode?.impactedClients
            ).map?.(
              (impactedClient) => {
                return { ...impactedClient, id: impactedClient?.mac?.[0] }
              }
            ),
          ...rest
        }
      }
    }
  )
  const renderMultiValue = (allValues: string[]) => {
    const values = allValues.filter(v => v)
    return <Tooltip placement='bottom' title={(values as string[]).join('\r\n')}>
      {values?.[0]}{values.length > 1 ? ` (${values.length})` : ''}
    </Tooltip>
  }
  const columns: TableProps<ImpactedClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'mac',
      key: 'mac',
      render: (_, { mac }) => (
        <TenantLink to={`users/wifi/clients/${mac?.[0]?.toLowerCase()}/details/troubleshooting`}>
          {mac}
        </TenantLink>
      ),
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Manufacturer' }),
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (_, { manufacturer }) => renderMultiValue(manufacturer as string[]),
      sorter: { compare: sortProp('manufacturer', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'OS Type' }),
      dataIndex: 'osType',
      key: 'osType',
      render: (_, { osType }) => renderMultiValue(osType as string[]),
      sorter: { compare: sortProp('osType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: 'ssid',
      key: 'ssid',
      render: (_, { ssid }) => renderMultiValue(ssid as string[]),
      sorter: { compare: sortProp('ssid', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'username',
      key: 'username',
      // eslint-disable-next-line max-len
      tooltip: $t({
        defaultMessage:
          'The username may only be known if the user has successfully passed authentication'
      }),
      render: (_, { username }) => renderMultiValue(username as string[]),
      sorter: { compare: sortProp('username', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      key: 'hostname',
      tooltip: $t({
        defaultMessage:
          // eslint-disable-next-line max-len
          'The hostname may only be known if the user has successfully obtained an IP address from DHCP'
      }),
      render: (_, { hostname }) => renderMultiValue(hostname as string[]),
      sorter: { compare: sortProp('hostname', defaultSort) }
    }
  ]
  const totalCount = queryResults?.data?.length ?? 0

  const filteredText = $t({ defaultMessage: `{count} Impacted {totalCount, plural,
    one {Client}
    other {Clients}
  } filtered by: {pieFilter}` }, {
    count: showTopNPieChartResult($t, totalCount, topImpactedClientLimit),
    totalCount, pieFilter: pieFilter?.name
  })

  const unfilteredText = $t({ defaultMessage: `{count} Impacted {totalCount, plural,
    one {Client}
    other {Clients}
  }` }, {
    count: showTopNPieChartResult($t, totalCount, topImpactedClientLimit), totalCount
  })

  return (
    <Loader states={[queryResults]}>
      <TableHeading>
        <b>{selectedStage && allowedPieFilter && $t(stageLabels[selectedStage])} </b>
        {allowedPieFilter && pieFilter ? filteredText : unfilteredText}
      </TableHeading>
      <Table
        columns={columns}
        dataSource={(queryResults.data)?.slice(0, topImpactedClientLimit) as ImpactedClient[]}
        rowKey='id'
        type='compactBordered'
      />
    </Loader>
  )
}
