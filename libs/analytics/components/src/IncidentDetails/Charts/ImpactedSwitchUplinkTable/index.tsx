import { useIntl } from 'react-intl'

import { defaultSort, overlapsRollup, sortProp }              from '@acx-ui/analytics/utils'
import { Card, Loader, Table, NoGranularityText, TableProps } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { DownloadOutlined }                                   from '@acx-ui/icons-new'
import { TenantLink }                                         from '@acx-ui/react-router-dom'
import { handleBlobDownloadFile }                             from '@acx-ui/utils'

import { ImpactedSwitchPortRow, useImpactedSwitchesUplinkQuery } from './services'

import type { ChartProps } from '../types.d'

export function ImpactedSwitchUplinkTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)
  const isMLISA = get('IS_MLISA_SA') === 'true'

  const response = useImpactedSwitchesUplinkQuery({ id },
    { skip: druidRolledup, selectFromResult: (response) => {
      return {
        ...response,
        data: response.data?.impactedSwitches.flatMap(
          ({ name, mac, serial , ports }) => {
            const portCheckRegEx = new RegExp('\\d+/\\d+/\\d+')
            return ports.map(port => {
              let portNumber = port.portNumber
              const isPort = portCheckRegEx.test(portNumber)
              if(!isPort) portNumber = portNumber + ' (LAG)'
              return{ name, mac, serial, ...port, portNumber }})
          })
          .flatMap(({ connectedDevice, ...item }, index) => ({
            ...item,
            ...connectedDevice,
            rowId: index
          })) }} }
  )

  const columnDefinitions = [{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Switch Name' }),
    render: (
      _: unknown,
      { mac, name, serial }: { mac: string; name: string; serial: string },
      __: unknown,
      highlightFn: (text: string) => React.ReactNode
    ) =>
      <TenantLink
        to={`devices/switch/${isMLISA ? mac : mac?.toLowerCase()}/${serial}/details/${isMLISA
          ? 'reports': 'overview'}`
        }>
        {highlightFn(name)}
      </TenantLink>,
    searchable: true,
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Switch MAC' }),
    searchable: true,
    sorter: { compare: sortProp('mac', defaultSort) }
  }, {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Switch Port/LAG' }),
    searchable: true,
    sorter: { compare: sortProp('portNumber', defaultSort) }
  }, {
    key: 'devicePort',
    dataIndex: 'devicePort',
    title: $t({ defaultMessage: 'Peer Port' }),
    width: 150,
    searchable: true,
    sorter: { compare: sortProp('devicePort', defaultSort) }
  }, {
    key: 'deviceName',
    dataIndex: 'deviceName',
    title: $t({ defaultMessage: 'Peer Device' }),
    searchable: true,
    sorter: { compare: sortProp('deviceName', defaultSort) }
  }, {
    key: 'deviceMac',
    dataIndex: 'deviceMac',
    title: $t({ defaultMessage: 'Peer Device MAC' }),
    width: 150,
    searchable: true,
    sorter: { compare: sortProp('deviceMac', defaultSort) }
  }]

  const handleExportCSV = () => {
    const headers = columnDefinitions.map(col => col.title)
    const csvData = response.data!.map(row =>
      columnDefinitions.map(col => {
        const value = row[col.dataIndex as keyof typeof row]
        return value || '--'
      })
    )

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n')

    handleBlobDownloadFile(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
      `impacted-switch-uplink-${incident.id}.csv`
    )
  }

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedSwitchesTable
          data={response.data!}
          incident={incident}
          columns={columnDefinitions}
          iconButton={response.data && response.data.length > 0 ? {
            icon: <DownloadOutlined />,
            onClick: handleExportCSV,
            tooltip: $t({ defaultMessage: 'Export to CSV' })
          } : undefined}
        />
      }
    </Card>
  </Loader>
}

function ImpactedSwitchesTable (props: {
  data: ImpactedSwitchPortRow[]
  incident: ChartProps['incident']
  columns: TableProps<ImpactedSwitchPortRow>['columns']
  iconButton?: {
    icon: React.ReactNode
    onClick: () => void
    tooltip: string
  }
}) {
  return <Table<ImpactedSwitchPortRow>
    columns={props.columns}
    rowKey='rowId'
    dataSource={props.data}
    pagination={{
      pageSize: 10
    }}
    iconButton={props.iconButton}
  />
}
