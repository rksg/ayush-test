import { useIntl, defineMessage } from 'react-intl'

import { AnalyticsFilter, sortProp, defaultSort, aggregateDataBy } from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps,
  Tooltip
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
  const columns: TableProps<ImpactedClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'Client MAC' }),
      dataIndex: 'mac',
      key: 'mac',
      render: (_, { mac }) => (
        <TenantLink to={`users/wifi/clients/${mac?.[0]?.toLowerCase()}/details/overview`}>
          {mac}
        </TenantLink>
      ),
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Manufacturer' }),
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: function (_, { manufacturer }) {
        return (
          <Tooltip placement='bottom' title={(manufacturer as string[]).join('\r\n')}>
            {manufacturer?.[0]}{manufacturer.length > 1 ? ` (${manufacturer.length})` : ''}
          </Tooltip>
        )
      },
      sorter: { compare: sortProp('manufacturer', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'SSID' }),
      dataIndex: 'ssid',
      key: 'ssid',
      render: function (_, { ssid }) {
        return (
          <Tooltip placement='bottom' title={(ssid as string[]).join('\r\n')}>
            {ssid?.[0]}{ssid.length > 1 ? ` (${ssid.length})` : ''}
          </Tooltip>
        )
      },
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
      render: function (_, { username }) {
        return (
          <Tooltip placement='bottom' title={(username as string[]).join('\r\n')}>
            {username?.[0]}{username.length > 1 ? ` (${username.length})` : ''}
          </Tooltip>
        )
      },
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
      render: function (_, { hostname }) {
        return (
          <Tooltip placement='bottom' title={(hostname as string[]).join('\r\n')}>
            {hostname?.[0]}{hostname.length > 1 ? ` (${hostname.length})` : ''}
          </Tooltip>
        )
      },
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
        <b>{selectedStage} </b>
        {$t(defineMessage({ defaultMessage: '{count} Impacted Clients' }), { count: totalCount })}
      </TableHeading>
      <Table
        columns={columns}
        dataSource={queryResults.data as ImpactedClient[]}
        rowKey='id'
        type='compactBordered'
      />
    </Loader>
  )
}
