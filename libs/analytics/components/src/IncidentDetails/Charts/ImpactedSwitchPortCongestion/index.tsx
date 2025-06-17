import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { defaultSort, sortProp }           from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps } from '@acx-ui/components'
import { DownloadOutlined }                from '@acx-ui/icons-new'
import { handleBlobDownloadFile }          from '@acx-ui/utils'

import { DetailsCard } from '../SwitchDetail/DetailsCard'
import { ChartProps }  from '../types'

import { usePortImpactedSwitchQuery, ImpactedSwitchPort } from './services'

type Port = {
  portNumber: string
  connectedDeviceName: string
}

/**
 * Displays details of the switch where the incident occurred.
 * @param {{ incident: Incident }} props
 * @returns {JSX.Element}
 */
export function SwitchDetail ({ incident }: ChartProps) {
  const impactedSwitch = usePortImpactedSwitchQuery({ id: incident.id, n: 100, search: '' })
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

  const columnDefinitions: TableProps<Port>['columns'] = [{
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Port Number/LAG' }),
    fixed: 'left' as const,
    width: 100,
    sorter: { compare: sortProp('portNumber', defaultSort) },
    searchable: true
  }, {
    key: 'connectedDeviceName',
    dataIndex: 'connectedDeviceName',
    title: $t({ defaultMessage: 'Peer Device' }),
    fixed: 'left' as const,
    width: 100,
    sorter: { compare: sortProp('connectedDevice.name', defaultSort) },
    searchable: true
  }]

  const handleExportCSV = () => {
    const headers = columnDefinitions.map(col => col.title)
    const csvData = impactedSwitch.data!.ports!.map(port => {
      const portCheckRegEx = new RegExp('\\d+/\\d+/\\d+')
      let portNumber = port.portNumber
      const isPort = portCheckRegEx.test(portNumber)
      if(!isPort) portNumber = portNumber + ' (LAG)'
      const deviceName = port.connectedDevice.name === 'Unknown' ? '--' :
        port.connectedDevice.name
      return [portNumber, deviceName]
    })

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n')

    const portText = impactedSwitch.data!.ports!.length === 1 ? 'Port' : 'Ports'
    handleBlobDownloadFile(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
      `Impacted-${portText}-Congestion-${incident.id}.csv`
    )
  }

  const transformPortData = (ports: ImpactedSwitchPort[]): Port[] => {
    return ports.map(port => {
      const portCheckRegEx = new RegExp('\\d+/\\d+/\\d+')
      let portNumber = port.portNumber
      const isPort = portCheckRegEx.test(portNumber)
      if(!isPort) portNumber = portNumber + ' (LAG)'
      return {
        portNumber,
        connectedDeviceName: port.connectedDevice.name === 'Unknown' ? '--' :
          port.connectedDevice.name
      }
    })
  }

  return <Loader states={[impactedSwitch]}>
    <Card title={$t({ defaultMessage: 'Impacted {portCount, plural, one {Port} other {Ports}}' },
      { portCount })}
    type='no-border'>
      <ImpactedSwitchTable
        data={impactedSwitch.data?.ports!}
        columns={columnDefinitions}
        transformData={transformPortData}
        iconButton={impactedSwitch.data?.ports && impactedSwitch.data.ports.length > 0 ? {
          icon: <DownloadOutlined />,
          onClick: handleExportCSV,
          tooltip: $t({ defaultMessage: 'Export to CSV' })
        } : undefined}
      />
    </Card>
  </Loader>
}

function ImpactedSwitchTable (props: {
    data: ImpactedSwitchPort[]
    columns: TableProps<Port>['columns']
    transformData: (data: ImpactedSwitchPort[]) => Port[]
    iconButton?: {
      icon: React.ReactNode
      onClick: () => void
      tooltip: string
    }
  }) {
  const rows = props.transformData(props.data)

  return <Table
    rowKey='portNumber'
    columns={props.columns}
    dataSource={rows}
    pagination={{ defaultPageSize: 5, pageSize: 5 }}
    iconButton={props.iconButton}
  />
}
