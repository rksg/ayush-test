import { useIntl } from 'react-intl'

import { Table, TableProps }   from '@acx-ui/components'
import { EdgeSdLanViewDataP2 } from '@acx-ui/rc/utils'

interface SmartEdgesTableProps {
  sdLanData: EdgeSdLanViewDataP2 | undefined;
}

interface SmartEdgesTableData {
  id: string;
  edgeName: string;
  vxlanTunnelNum?: number;
  vlanNum?: number;
}

export const SmartEdgesTable = (props: SmartEdgesTableProps) => {
  const { sdLanData } = props
  const { $t } = useIntl()

  const tableData = [] as SmartEdgesTableData[]
  if (sdLanData) {
    tableData.push({
      id: sdLanData.edgeId,
      edgeName: sdLanData.edgeName!,
      vxlanTunnelNum: sdLanData.vxlanTunnelNum,
      vlanNum: sdLanData.vlanNum
    })

    if (sdLanData.isGuestTunnelEnabled) {
      tableData.push({
        id: sdLanData.guestEdgeId,
        edgeName: sdLanData.guestEdgeName!,
        vxlanTunnelNum: undefined,
        vlanNum: undefined
      })
    }
  }

  const columns: TableProps<SmartEdgesTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edgeName',
      dataIndex: 'edgeName',
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
      sorter: true
    }
  ]

  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={tableData}
    />
  )
}
