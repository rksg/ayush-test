import { useMemo } from 'react'

import { MessageDescriptor,
  defineMessage, useIntl, FormattedMessage }          from 'react-intl'


import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
import {  Card, Loader, Table,
  TableProps, Tooltip }         from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { TenantLink }                from '@acx-ui/react-router-dom'

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
    { key: 'numOfPorts', title: defineMessage({ defaultMessage: 'Number of ports' }) },
    { key: 'portCount', title: defineMessage({ defaultMessage: 'Ports with flap' }) }
  ]

  const data = {
    ...impactedSwitch.data,
    portCount: impactedSwitch.data?.ports?.length
  }

  return <Loader states={[impactedSwitch]}>
    <DetailsCard fields={fields} data={data} impactedSwitch={impactedSwitch} />
  </Loader>
}

export function ImpactedSwitchPortFlapTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA') === 'true'

  const impactedSwitch = usePortFlapImpactedSwitchQuery({ id: incident.id, n: 100, search: '' })
  const portCount = impactedSwitch.data?.ports?.length

  const getSwitchDetailsPath = () => {
    const mac = impactedSwitch.data?.mac
    if (mac) {
      return `devices/switch/${isMLISA ? mac : mac.toLowerCase()}/serial/details/${
        isMLISA ? 'reports' : 'overview'
      }`
    }
    return ''
  }

  // Sort ports by lastFlapTime in descending order (newest first)
  // This ensures that the most recent port flaps appear at the top of the table
  const sortedPorts = useMemo(() => {
    if (!impactedSwitch.data?.ports) return []
    return [...impactedSwitch.data.ports].sort((a, b) => {
      const timeA = new Date(a.lastFlapTime).getTime()
      const timeB = new Date(b.lastFlapTime).getTime()
      return timeB - timeA // descending order
    })
  }, [impactedSwitch.data?.ports])

  return <Loader states={[impactedSwitch]}>
    <Card
      title={$t({ defaultMessage: 'Impacted {portCount, plural, one {Port} other {Ports}}' },
        { portCount })}
      type='no-border'>
      <p>
        <FormattedMessage
          defaultMessage='Port flap detected at {name}'
          values={{
            name: (
              <TenantLink to={getSwitchDetailsPath()}>
                {impactedSwitch.data?.name}
              </TenantLink>
            )
          }}
        />
      </p>
      <ImpactedSwitchTable data={sortedPorts} />
    </Card>
  </Loader>
}

function ImpactedSwitchTable (props: {
    data: ImpactedSwitchPort[]
  }) {
  type Port = { portNumber: string; connectedDeviceName: string; connectedDevicePortType: string }
  const { $t } = useIntl()
  const ports = props.data

  const formatVlans = (vlans: string) => {
    if (!vlans) return '--'
    const vlanList = vlans.split(',').map(v => v.trim())
    if (vlanList.length <= 5) return vlans
    return (
      <Tooltip title={vlans}>
        {vlanList.slice(0, 5).join(', ')} and more
      </Tooltip>
    )
  }

  const rows: Port[] = ports.map(impactedSwitchPort => {
    return {
      portNumber: impactedSwitchPort.portNumber,
      portType: impactedSwitchPort.type,
      lastFlapTimeStamp: formatter(DateFormatEnum.DateTimeFormat)(impactedSwitchPort.lastFlapTime),
      poeDetail: impactedSwitchPort.poeOperState === 'Unknown' ? '--' :
        impactedSwitchPort.poeOperState,
      vlan: formatVlans(impactedSwitchPort.flapVlans),
      connectedDeviceName: impactedSwitchPort.connectedDevice.name === 'Unknown' ? '--' :
        impactedSwitchPort.connectedDevice.name,
      connectedDevicePortType: impactedSwitchPort.connectedDevice.type === 'Unknown' ? '--' :
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
    sorter: { compare: sortProp('type', defaultSort) },
    searchable: true
  }, {
    key: 'vlan',
    dataIndex: 'vlan',
    title: $t({ defaultMessage: 'VLAN' }),
    fixed: 'left',
    width: 40,
    sorter: { compare: sortProp('flapVlans', defaultSort) },
    searchable: true
  }, {
    key: 'poeDetail',
    dataIndex: 'poeDetail',
    title: $t({ defaultMessage: 'POE Detail' }),
    fixed: 'left',
    width: 60,
    sorter: { compare: sortProp('poeOperState', defaultSort) },
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
    key: 'lastFlapTimeStamp',
    dataIndex: 'lastFlapTimeStamp',
    title: $t({ defaultMessage: 'Last Flap Time Stamp' }),
    fixed: 'left',
    width: 70,
    sorter: { compare: sortProp('lastFlapTime', defaultSort) },
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
