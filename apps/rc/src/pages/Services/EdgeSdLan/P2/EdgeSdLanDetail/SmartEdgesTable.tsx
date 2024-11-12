import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip } from '@acx-ui/components'
import { EdgeSdLanViewDataP2 }        from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface SmartEdgesTableProps {
  sdLanData: EdgeSdLanViewDataP2 | undefined;
}

interface SmartEdgesTableData {
  id: string;
  edgeClusterName: string;
  vxlanTunnelNum?: number;
  vlanNum?: number;
  vlans?: string[]
}

export const SmartEdgesTable = (props: SmartEdgesTableProps) => {
  const { sdLanData } = props
  const { $t } = useIntl()

  const tableData = [] as SmartEdgesTableData[]
  if (sdLanData) {
    tableData.push({
      id: sdLanData.edgeClusterId,
      edgeClusterName: sdLanData.edgeClusterName!,
      vxlanTunnelNum: sdLanData.vxlanTunnelNum,
      vlanNum: sdLanData.vlanNum,
      vlans: sdLanData.vlans
    })

    if (sdLanData.isGuestTunnelEnabled) {
      tableData.push({
        id: sdLanData.guestEdgeClusterId,
        edgeClusterName: sdLanData.guestEdgeClusterName!,
        vxlanTunnelNum: sdLanData.guestVxlanTunnelNum,
        vlanNum: sdLanData.guestVlanNum,
        vlans: sdLanData.guestVlans
      })
    }
  }

  const columns: TableProps<SmartEdgesTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edgeClusterName',
      dataIndex: 'edgeClusterName',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: '# of tunnels' }),
      key: 'vxlanTunnelNum',
      dataIndex: 'vxlanTunnelNum',
      sorter: true
    },
    {
      title: $t({ defaultMessage: '# of tunneled VLANs' }),
      key: 'vlanNum',
      dataIndex: 'vlanNum',
      sorter: true,
      render: (_, row) => {
        return (row.vlanNum && row.vlans)
          ? <Tooltip
            placement='bottom'
            title={
              row.vlans.map(vlan => (
                <Row key={`edge-sdlan-tooltip-${vlan}`}>
                  {vlan}
                </Row>
              ))
            }
          >
            <span data-testid={`sdlan-vlan-${row.id}`}>{row.vlanNum}</span>
          </Tooltip>
          : row.vlanNum
      }
    }
  ]

  return (
    <>
      <Row justify='end'>
        <UI.StyledTableInfoText>
          {$t({ defaultMessage: '(Stats updated every 5 mins)' })}
        </UI.StyledTableInfoText>
      </Row>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableData}
      />
    </>
  )
}
