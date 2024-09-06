import { Dispatch, SetStateAction, useState } from 'react'

import { useIntl } from 'react-intl'

import { overlapsRollup }                                      from '@acx-ui/analytics/utils'
import {  Card, Loader, Table, TableProps, NoGranularityText } from '@acx-ui/components'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchDDoSQuery
} from './services'

import type { ChartProps } from '../types.d'

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
        : <VLANsTable data={response.data!} {...{ selected, onChange: setSelected }} />
      }
    </Card>
  </Loader>
}



function VLANsTable (props: {
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
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Port Number' })
  }]

  return <Table
    columns={columns}
    rowKey='index'
    dataSource={rows}
    tableAlertRender={false}
    pagination={{ defaultPageSize: rows?.length }}
  />
}
