import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { defaultSort, overlapsRollup, sortProp }                                   from '@acx-ui/analytics/utils'
import {  Card, Loader, Table, TableProps, NoGranularityText, cssStr, DonutChart } from '@acx-ui/components'
import { intlFormats }                                                             from '@acx-ui/formatter'
import { TenantLink }                                                              from '@acx-ui/react-router-dom'

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

  const transformData = (data:{ impactedCount:number,totalCount:number })=>{
    return [
      { value: data.impactedCount,
        name: 'Impacted Switches',
        color: cssStr('--acx-semantics-red-50') },
      { value: (data.totalCount - data.impactedCount), // Math.ceil(data.impactedCount * 0.3),
        name: 'Non-impacted Switches',
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

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = useMemo(()=>[{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (_, { mac, name },__,highlightFn) =>
      <TenantLink to={`devices/switch/${mac}/serial/details/incidents`}>
        {highlightFn(name)}
      </TenantLink>,
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) },
    defaultSortOrder: 'ascend',
    searchable: true
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    fixed: 'left',
    sorter: { compare: sortProp('mac', defaultSort) },
    searchable: true
  }, {
    key: 'serial',
    dataIndex: 'serial',
    title: $t({ defaultMessage: 'Switch Serial' }),
    fixed: 'left',
    sorter: { compare: sortProp('serial', defaultSort) },
    searchable: true
  }, {
    key: 'portNumbers',
    dataIndex: 'portNumbers',
    title: $t({ defaultMessage: 'Port Numbers' }),
    fixed: 'left',
    sorter: { compare: sortProp('portNumbers', defaultSort) },
    searchable: true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }],[])

  return <Table
    columns={columns}
    dataSource={rows}
    pagination={{ defaultPageSize: 5, pageSize: 5 }}
  />
}
