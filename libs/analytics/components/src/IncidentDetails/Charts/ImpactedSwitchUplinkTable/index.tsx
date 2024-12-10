import { useIntl } from 'react-intl'

import { overlapsRollup }                                     from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps, NoGranularityText } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { TenantLink }                                         from '@acx-ui/react-router-dom'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchesUplinkQuery
} from './services'

import type { ChartProps } from '../types.d'

export function ImpactedSwitchUplinkTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesUplinkQuery({ id },
    { skip: druidRolledup, selectFromResult: (response) => {
      return {
        ...response,
        data: response.data?.impactedSwitches.flatMap(
          ({ name, mac, serial , ports }) => ports.map(port => ({ name, mac, serial, ...port })))
          .flatMap(({ connectedDevice, ...item }, index) => ({
            ...item,
            ...connectedDevice,
            rowId: index
          })) }} }
  )

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedSwitchesTable data={response.data!} />
      }
    </Card>
  </Loader>
}



function ImpactedSwitchesTable (props: {
  data: ImpactedSwitchPortRow[]
}) {
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')
  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (_, { mac, name, serial },__,highlightFn) =>
      <TenantLink
        to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/${serial}/details/${isMLISA
          ? 'reports': 'overview'}`
        }>
        {highlightFn(name)}
      </TenantLink>,
    searchable: true
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    searchable: true
  }, {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Switch Port' }),
    searchable: true
  },
  {
    key: 'connectedDevicePort',
    dataIndex: 'devicePort',
    title: $t({ defaultMessage: 'Peer Port' }),
    width: 150,
    searchable: true
  }, {
    key: 'connectedDeviceName',
    dataIndex: 'deviceName',
    title: $t({ defaultMessage: 'Peer Device' }),
    searchable: true
  }, {
    key: 'connectedDeviceMac',
    dataIndex: 'deviceMac',
    title: $t({ defaultMessage: 'Peer Device MAC' }),
    width: 150,
    searchable: true
  }
  ]

  return <Table<ImpactedSwitchPortRow>
    columns={columns}
    rowKey='rowId'
    dataSource={props.data}
    pagination={{
      pageSize: 10
    }}
  />
}
