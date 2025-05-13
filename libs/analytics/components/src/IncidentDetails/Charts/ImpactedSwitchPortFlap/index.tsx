import { useMemo } from 'react'

import { MessageDescriptor,
  defineMessage, useIntl }          from 'react-intl'

import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
import {  Card, Loader, Table,
  TableProps }         from '@acx-ui/components'

import { DetailsCard } from '../SwitchDetail/DetailsCard'
import { ChartProps }  from '../types'

import { usePortFlapImpactedSwitchQuery,
  ImpactedSwitchPort }          from './services'


/**
 * Displays details of the switch where the incident occurred.
 * @param {{ incident: Incident }} props
 * @returns {JSX.Element}
 */
export function SwitchDetail ({ incident }: ChartProps) {

  const impactedSwitch = usePortFlapImpactedSwitchQuery({ id: incident.id,
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
    { key: 'firmware', title: defineMessage({ defaultMessage: 'Switch Firmware Version' }) },
    { key: 'portCount', title: defineMessage({ defaultMessage: 'Impacted Port Count' }) }
  ]

  const data = {
    ...impactedSwitch.data,
    portCount: impactedSwitch.data?.ports?.length
  }

  return <Loader states={[impactedSwitch]}>
    <DetailsCard fields={fields} data={data} impactedSwitch={impactedSwitch} />
  </Loader>
}

export function ImpactedSwitchPortConjestionTable ({ incident }: ChartProps) {
  const { $t } = useIntl()

  const impactedSwitch = usePortFlapImpactedSwitchQuery({ id: incident.id, n: 100, search: '' })
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
  type Port = { portNumber: string; connectedDeviceName: string; connectedDevicePortType: string }
  const { $t } = useIntl()
  const ports = props.data
  const rows: Port[] = ports.map(impactedSwitchPort => {
    const portCheckRegEx = new RegExp('\\d+/\\d+/\\d+')
    let portNumber = impactedSwitchPort.portNumber
    const isPort = portCheckRegEx.test(portNumber)
    if(!isPort) portNumber = portNumber + ' (LAG)'
    return {
      portNumber: portNumber,
      portType: 'Copper',
      portStatus: 'Up',
      lastFlapTimeStamp: '2023-10-10 12:00:00',
      poeDetail: 'PoE+',
      vlan: 'VLAN 10',
      connectedDeviceName: impactedSwitchPort.connectedDevice.name === 'Unknown' ? '--' :
        impactedSwitchPort.connectedDevice.name,
      connectedDevicePortType: impactedSwitchPort.connectedDevice.type === null ? '--' :
        impactedSwitchPort.connectedDevice.type
    }
  })

  const columns: TableProps<Port>['columns'] = useMemo(()=>[ {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Port Id' }),
    fixed: 'left',
    width: 40,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'portType',
    dataIndex: 'portType',
    title: $t({ defaultMessage: 'Port Type' }),
    fixed: 'left',
    width: 50,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'vlan',
    dataIndex: 'vlan',
    title: $t({ defaultMessage: 'VLAN' }),
    fixed: 'left',
    width: 40,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'poeDetail',
    dataIndex: 'poeDetail',
    title: $t({ defaultMessage: 'POE Detail' }),
    fixed: 'left',
    width: 60,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'connectedDevicePortType',
    dataIndex: 'connectedDevicePortType',
    title: $t({ defaultMessage: 'Remote Device Port Type' }),
    fixed: 'left',
    width: 90,
    sorter: { compare: sortProp('connectedDevice.type', defaultSort) },
    searchable: true
  }, {
    key: 'connectedDeviceName',
    dataIndex: 'connectedDeviceName',
    title: $t({ defaultMessage: 'Remote Device Port' }),
    fixed: 'left',
    width: 70,
    sorter: { compare: sortProp('connectedDevice.name', defaultSort) },
    searchable: true
  }, {
    key: 'portStatus',
    dataIndex: 'portStatus',
    title: $t({ defaultMessage: 'Port status' }),
    fixed: 'left',
    width: 50,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'lastFlapTimeStamp',
    dataIndex: 'lastFlapTimeStamp',
    title: $t({ defaultMessage: 'Last Flap Time Stamp' }),
    fixed: 'left',
    width: 70,
    sorter: { compare: sortProp('portNumber', defaultSort) },
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
