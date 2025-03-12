import { useMemo } from 'react'

import { MessageDescriptor,
  defineMessage, useIntl }          from 'react-intl'

import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
import {  Card, Loader, Table,
  TableProps }         from '@acx-ui/components'

import { DetailsCard } from '../SwitchDetail/DetailsCard'
import { ChartProps }  from '../types'

import { usePortImpactedSwitchQuery,
  ImpactedSwitchPort }          from './services'


/**
 * Displays details of the switch where the incident occurred.
 * @param {{ incident: Incident }} props
 * @returns {JSX.Element}
 */
export function SwitchDetail ({ incident }: ChartProps) {

  const impactedSwitch = usePortImpactedSwitchQuery({ id: incident.id,
    n: 100, search: '' })
  const fields: {
    key: string
    title: MessageDescriptor
    Component?: ({ value }: { value: number }) => JSX.Element
    valueFormatter?: (value: number) => string
    infoFormatter?: (value: string) => string
  }[] = [
    { key: 'name', title: defineMessage({ defaultMessage: 'Switch Name' }) },
    { key: 'model', title: defineMessage({ defaultMessage: 'Switch Model' }) },
    { key: 'mac', title: defineMessage({ defaultMessage: 'Switch MAC' }) },
    { key: 'firmware', title: defineMessage({ defaultMessage: 'Switch Firmware Version' }) }
  ]

  const data = {
    ...impactedSwitch.data
  }

  return <Loader states={[impactedSwitch]}>
    <DetailsCard fields={fields} data={data} impactedSwitch={impactedSwitch} />
  </Loader>
}

export function ImpactedSwitchPortConjestionTable ({ incident }: ChartProps) {
  const { $t } = useIntl()

  const impactedSwitch = usePortImpactedSwitchQuery({ id: incident.id, n: 100, search: '' })
  const portCount = impactedSwitch.data?.ports?.length

  return <Loader states={[impactedSwitch]}>
    <Card title={$t({ defaultMessage: 'Impacted {portCount, plural, one {Port} other {Ports}}' },
      { portCount })}
    type='no-border'>
      <ImpactedSwitchTable data={impactedSwitch.data?.ports!} />
    </Card>
  </Loader>
}

function ImpactedSwitchTable (props: {
    data: ImpactedSwitchPort[]
  }) {
  type Port = { portNumber: string; connectedDeviceName: string; }
  const { $t } = useIntl()
  const ports = props.data
  const rows: Port[] = ports.map(impactedSwitchPort => {
    const portCheckRegEx = new RegExp('\\d+/\\d+/\\d+')
    let portNumber = impactedSwitchPort.portNumber
    const isPort = portCheckRegEx.test(portNumber)
    if(!isPort) portNumber = portNumber + ' (LAG)'
    return {
      portNumber: portNumber,
      connectedDeviceName: impactedSwitchPort.connectedDevice.name === 'Unknown' ? '--' :
        impactedSwitchPort.connectedDevice.name
    }
  })

  const columns: TableProps<Port>['columns'] = useMemo(()=>[ {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Port Number/LAG' }),
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'connectedDeviceName',
    dataIndex: 'connectedDeviceName',
    title: $t({ defaultMessage: 'Peer Device' }),
    fixed: 'left',
    width: 100,
    sorter: { compare: sortProp('connectedDevice.name', defaultSort) },
    searchable: true
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[])

  return <Table
    rowKey='portNumber'
    columns={columns}
    dataSource={rows}
    pagination={{ defaultPageSize: 5, pageSize: 5 }}
  />
}
