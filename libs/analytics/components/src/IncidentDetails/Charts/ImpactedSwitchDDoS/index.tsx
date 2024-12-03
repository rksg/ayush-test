import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { defaultSort, overlapsRollup, sortProp } from '@acx-ui/analytics/utils'
import {  Card, Loader, Table,
  TableProps, NoGranularityText, cssStr,
  DonutChart, showToast,
  Tooltip } from '@acx-ui/components'
import { get }          from '@acx-ui/config'
import { intlFormats }  from '@acx-ui/formatter'
import { CopyOutlined } from '@acx-ui/icons-new'
import { TenantLink }   from '@acx-ui/react-router-dom'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchDDoSAndTotalSwitchCountQuery,
  useImpactedSwitchDDoSQuery
} from './services'

import type { ChartProps } from '../types'

export function ImpactedSwitchDDoSTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchDDoSQuery({ id },
    { skip: druidRolledup })

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedSwitchTable data={response.data!} />
      }
    </Card>
  </Loader>
}

export function ImpactedSwitchDDoSDonut ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchDDoSAndTotalSwitchCountQuery({ id },
    { skip: druidRolledup })

  const impactedSwitchCount = response.data?.impactedCount ?? 0
  const totalSwitchCount = response.data?.totalCount ?? 0

  const title=$t({ defaultMessage: 'Total Switch{plural}' },
    { plural: totalSwitchCount > 1 ? 'es' : '' })
  const subtitle = $t({
    defaultMessage: 'This incident impacted {impactedSwitchCount} switch{plural}' },
  { impactedSwitchCount, plural: impactedSwitchCount > 1 ? 'es' : '' })

  const impactedCountText = $t({
    defaultMessage: 'Impacted Switch{plural}' },
  { impactedSwitchCount, plural: impactedSwitchCount > 1 ? 'es' : '' })

  const nonImpactedCountText = $t({
    defaultMessage: 'Non-impacted Switch{plural}' },
  { impactedSwitchCount, plural: (totalSwitchCount - impactedSwitchCount) > 1 ? 'es' : '' })

  const transformData = (data:{ impactedCount:number,totalCount:number })=>{
    return [
      { value: data.impactedCount,
        name: impactedCountText,
        color: cssStr('--acx-semantics-red-50') },
      { value: (data.totalCount - data.impactedCount),
        name: nonImpactedCountText,
        color: cssStr('--acx-semantics-green-50') }
    ]
  }

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Switch Distribution' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              showLegend={false}
              title={title}
              subTitle={subtitle}
              legend='name-value'
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={transformData(response.data!)}/>
          )}
        </AutoSizer>
      }
    </Card>
  </Loader>
}



function ImpactedSwitchTable (props: {
  data: ImpactedSwitchPortRow[]
}) {
  const { $t } = useIntl()
  const rows = props.data
  const isMLISA = get('IS_MLISA_SA')

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = useMemo(()=>[{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (_, { mac, name },__,highlightFn) =>
      <TenantLink
        to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/serial/details/${isMLISA
          ? 'reports': 'overview'}`
        }>
        {highlightFn(name)}
      </TenantLink>,
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('name', defaultSort) },
    defaultSortOrder: 'ascend',
    searchable: true
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('mac', defaultSort) },
    searchable: true
  }, {
    key: 'serial',
    dataIndex: 'serial',
    title: $t({ defaultMessage: 'Switch Serial' }),
    fixed: 'left',
    width: 80,
    sorter: { compare: sortProp('serial', defaultSort) },
    searchable: true
  }, {
    key: 'portNumbers',
    dataIndex: 'portNumbers',
    title: $t({ defaultMessage: 'Port Numbers' }),
    fixed: 'left',
    width: 250,
    sorter: { compare: sortProp('portNumbers', defaultSort) },
    searchable: true
  }, {
    key: 'action',
    dataIndex: 'action',
    title: $t({ defaultMessage: 'Action' }),
    width: 50,
    render: (_, { portNumbers, portCount }) => {
      return (
        <Tooltip
          title={$t({ defaultMessage: 'Copy Port number{plural} to clipboard.' }
            ,{ plural: portCount > 1 ? 's' : '' })}
          placement='top'>
          <CopyOutlined
            onClick={() => {
              navigator.clipboard.writeText(portNumbers)
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Port number{plural} copied to clipboard.' },
                  { plural: portCount > 1 ? 's' : '' }
                )
              })
            }}
            size='sm'
            style={{ cursor: 'pointer' }}/>
        </Tooltip>
      )
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[])

  return <Table
    rowKey='mac'
    columns={columns}
    dataSource={rows}
    pagination={{ defaultPageSize: 5, pageSize: 5 }}
  />
}
