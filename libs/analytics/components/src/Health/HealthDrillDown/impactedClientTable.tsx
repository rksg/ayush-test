import { uniqueId }               from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { AnalyticsFilter, sortProp, defaultSort } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import {
  Stages,
  DrilldownSelection,
  topImpactedClientLimit
} from './config'
import { useImpactedClientsQuery, ImpactedClient } from './services'
import { TableHeading }                            from './styledComponents'


export const ImpactedClientsTable = ({
  filters,
  selectedStage,
  drillDownSelection
}: {
  filters: AnalyticsFilter;
  selectedStage: Stages;
  drillDownSelection: DrilldownSelection;
}) => {
  const { $t } = useIntl()
  const fieldMap = {
    connectionFailure: 'topNImpactedClientbyConnFailure',
    ttc: 'topNImpactedClientbyAvgTTC'
  }
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }
  const field = fieldMap?.[drillDownSelection as keyof typeof fieldMap]
  const queryResults = useImpactedClientsQuery(
    {
      ...payload,
      field: field,
      stage: selectedStage?.toLowerCase() as string,
      topImpactedClientLimit: topImpactedClientLimit
    },
    {
      selectFromResult: (result) => {
        const { data, ...rest } = result
        return {
          data: data?.network?.hierarchyNode?.impactedClients?.map?.(
            (impactedClient: ImpactedClient) => {
              return { ...impactedClient, id: uniqueId() }
            }
          ),
          ...rest
        }
      }
    }
  )
  const columns: TableProps<ImpactedClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'mac',
      key: 'mac',
      render: (_, { mac }) => (
        <TenantLink to={`users/wifi/clients/${mac?.toLowerCase()}/details/overview`}>
          {mac}
        </TenantLink>
      ),
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Manufacturer' }),
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      sorter: { compare: sortProp('manufacturer', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: 'ssid',
      key: 'ssid',
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
      sorter: { compare: sortProp('hostname', defaultSort) }
    }
  ]
  const totalCount =
    queryResults?.data?.length && topImpactedClientLimit < queryResults?.data?.length
      ? `${$t(defineMessage({ defaultMessage: 'Top' }))} ${topImpactedClientLimit}`
      : queryResults?.data?.length
  return (
    <Loader states={[queryResults]}>
      <TableHeading>
        <b>{selectedStage}{' '}</b>
        {$t(defineMessage({ defaultMessage: '{count} Impacted Clients' }), { count: totalCount })}
      </TableHeading>
      <Table columns={columns} dataSource={queryResults.data} rowKey='id' type='compactBordered' />
    </Loader>
  )
}
