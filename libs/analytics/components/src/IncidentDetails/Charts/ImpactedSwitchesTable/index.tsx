import { useIntl } from 'react-intl'

import { overlapsRollup }         from '@acx-ui/analytics/utils'
import { Incident }               from '@acx-ui/analytics/utils'
import {  Card, Loader, Table,
  TableProps, NoGranularityText } from '@acx-ui/components'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchesQuery
} from './services'


interface ImpactedTableProps {
    incident: Incident
    columns: TableProps<ImpactedSwitchPortRow>['columns']
}

export function ImpactedSwitchesTable ({ incident, columns }: ImpactedTableProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesQuery({ id },
    { skip: druidRolledup })

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedSwitchTable data={response.data!} columns={columns} />
      }
    </Card>
  </Loader>
}

function ImpactedSwitchTable (props: {
  data: ImpactedSwitchPortRow[]
  columns: TableProps<ImpactedSwitchPortRow>['columns']
}) {
  const rows = props.data

  return <Table
    rowKey={(record) => (props.columns.find((column) => column.key === 'reasonCodes') ?
      `${record.mac}_${record.reasonCodes}` : record.mac)}
    columns={props.columns}
    dataSource={rows}
    pagination={{ defaultPageSize: 5, pageSize: 5 }}
  />
}
