import { useIntl } from 'react-intl'

import { Button, Table,TableProps }                                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                from '@acx-ui/feature-toggle'
import { formatter }                                                                                             from '@acx-ui/formatter'
import { defaultSort, EdgeLagStatus, EdgePortStatus, getEdgePortDisplayName, getEdgePortIpModeString, sortProp } from '@acx-ui/rc/utils'

interface EdgePortsTableProps {
  portData: EdgePortStatus[]
  lagData: EdgeLagStatus[]
  handleClickLagName?: () => void
}

interface EdgePortsTableDataType extends EdgePortStatus {
  lagName?: string
}

export const EdgePortsTable = (props: EdgePortsTableProps) => {
  const { portData, lagData, handleClickLagName } = props
  const { $t } = useIntl()
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)

  const showPortInfo = (portId: string, data:string) => {
    if(isEdgeLagEnabled && lagData?.length > 0) {
      const isLagMember = lagData.some(lag =>
        lag.lagMembers.some(member =>
          member.portId === portId))
      return isLagMember ? '' : data
    }
    return data
  }

  const columns: TableProps<EdgePortsTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Name' }),
      key: 'id',
      dataIndex: 'id',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('interfaceName', defaultSort) },
      render: (_, row) => {
        return getEdgePortDisplayName(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'name',
      width: 200,
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: { compare: sortProp('status', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      sorter: { compare: sortProp('adminStatus', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      render: (_, { portId, type }) => {
        return showPortInfo(portId, type)
      }
    },
    {
      title: $t({ defaultMessage: 'Interface MAC' }),
      key: 'mac',
      dataIndex: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: { compare: sortProp('ip', defaultSort) },
      render: (_, { portId, ip }) => {
        return showPortInfo(portId, ip)
      }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      sorter: { compare: sortProp('ipMode', defaultSort) },
      render: (_, { portId, ipMode }) => {
        const ipModeUpperCase = ipMode.toUpperCase()
        const ipModeStr = getEdgePortIpModeString($t, ipModeUpperCase)
        return showPortInfo(portId, ipModeStr)
      }
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speedKbps',
      dataIndex: 'speedKbps',
      sorter: { compare: sortProp('speedKbps', defaultSort) },
      render: (_, row) => {
        return formatter('networkSpeedFormat')(row.speedKbps)
      }
    },
    ...(isEdgeLagEnabled ? [{
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'lagName',
      dataIndex: 'lagName',
      sorter: { compare: sortProp('lagName', defaultSort) },
      render: (_: React.ReactNode, row: EdgePortsTableDataType) => {
        return <Button
          size='small'
          type='link'
          onClick={handleClickLagName}
          children={row.lagName}
        />
      }
    }] : [])
  ]

  return (
    <Table
      settingsId='edge-ports-table'
      rowKey='portId'
      columns={columns}
      dataSource={aggregatePortData(portData, lagData)}
    />
  )
}

const aggregatePortData = (portData: EdgePortStatus[],
  lagData: EdgeLagStatus[]): EdgePortsTableDataType[] => {
  return portData.map(portItem => {
    const targetLagData = lagData.find(
      lagItem => lagItem.lagMembers?.some(
        lagMemberItem => lagMemberItem.portId === portItem.portId
      ))
    return {
      ...portItem,
      lagName: targetLagData?.name
    }
  })
}
