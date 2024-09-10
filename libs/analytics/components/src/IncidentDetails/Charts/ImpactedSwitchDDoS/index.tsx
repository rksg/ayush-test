import { Dispatch, SetStateAction, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { overlapsRollup }                                                          from '@acx-ui/analytics/utils'
import {  Card, Loader, Table, TableProps, NoGranularityText, cssStr, DonutChart } from '@acx-ui/components'
import { intlFormats }                                                             from '@acx-ui/formatter'

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

  const [selected, setSelected] = useState(0)

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedSwitchTable data={response.data!} {...{ selected, onChange: setSelected }} />
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
      { value: Math.ceil(data.impactedCount * 0.3), // (data.totalCount - data.impactedCount),
        name: 'Unimpacted Switches',
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
  selected: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  const { $t } = useIntl()
  const rows = props.data

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' })
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' })
  }, {
    key: 'serial',
    dataIndex: 'serial',
    title: $t({ defaultMessage: 'Switch Serial' })
  }, {
    key: 'portNumbers',
    dataIndex: 'portNumbers',
    title: $t({ defaultMessage: 'Port Numbers' })
  }]

  return <Table
    columns={columns}
    rowKey='index'
    dataSource={rows}
    tableAlertRender={false}
    pagination={{ defaultPageSize: rows?.length }}
  />
}
