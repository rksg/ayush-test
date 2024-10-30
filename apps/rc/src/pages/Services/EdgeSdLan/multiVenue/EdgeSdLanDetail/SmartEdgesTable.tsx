import { useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Button, Table, TableProps, Tooltip }         from '@acx-ui/components'
import { EdgeMvSdLanViewData, sortProp, defaultSort } from '@acx-ui/rc/utils'


import { CurrentEdgeInfo, EdgeInfoDrawer } from './EdgeInfoDrawer'
import * as UI                             from './styledComponents'

interface SmartEdgesTableProps {
  sdLanData?: EdgeMvSdLanViewData
}

interface SmartEdgesTableData {
  id: string
  edgeClusterName: string
  vxlanTunnelNum?: number
  vlanNum?: number
  vlans?: string[]
  activeApCount?: number
  isDmzEdgeCluster: boolean
}

export const SmartEdgesTable = (props: SmartEdgesTableProps) => {
  const { sdLanData } = props
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  // eslint-disable-next-line max-len
  const [currentEdgeInfo, setCurrentEdgeInfo] = useState({} as CurrentEdgeInfo)

  const tableData = [] as SmartEdgesTableData[]
  if (sdLanData) {

    tableData.push({
      id: sdLanData.edgeClusterId ?? '',
      edgeClusterName: sdLanData.edgeClusterName!,
      vxlanTunnelNum: sdLanData.vxlanTunnelNum,
      vlanNum: sdLanData.vlanNum,
      vlans: sdLanData.vlans,
      activeApCount: sdLanData.edgeClusterTunnelInfo?.reduce((partialSum, item) =>
        partialSum + (item.activeApCount ?? 0), 0) ?? 0,
      isDmzEdgeCluster: false
    })

    if (sdLanData.isGuestTunnelEnabled) {
      tableData.push({
        id: sdLanData.guestEdgeClusterId ?? '',
        edgeClusterName: sdLanData.guestEdgeClusterName!,
        vxlanTunnelNum: sdLanData.guestVxlanTunnelNum,
        vlanNum: sdLanData.guestVlanNum,
        vlans: sdLanData.guestVlans,
        isDmzEdgeCluster: true
      })
    }
  }

  const openEdgeInfoDrawer = (data: SmartEdgesTableData) => {
    setCurrentEdgeInfo({
      clusterId: data.id,
      clusterName: data.edgeClusterName,
      isDmzCluster: data.isDmzEdgeCluster
    })
    setDrawerVisible(true)
  }

  const columns: TableProps<SmartEdgesTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edgeClusterName',
      dataIndex: 'edgeClusterName',
      sorter: { compare: sortProp('edgeClusterName', defaultSort) },
      defaultSortOrder: 'ascend',
      render: (_, row) => (
        <Button
          type='link'
          onClick={() => openEdgeInfoDrawer(row)}
          children={row.edgeClusterName}
        />
      )
    },
    {
      title: $t({ defaultMessage: '# of tunnels' }),
      key: 'vxlanTunnelNum',
      dataIndex: 'vxlanTunnelNum',
      sorter: { compare: sortProp('vxlanTunnelNum', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Active APs' }),
      key: 'activeApCount',
      dataIndex: 'activeApCount',
      sorter: { compare: sortProp('activeApCount', defaultSort) }
    },
    {
      title: $t({ defaultMessage: '# of tunneled VLANs' }),
      key: 'vlanNum',
      dataIndex: 'vlanNum',
      sorter: { compare: sortProp('vlanNum', defaultSort) },
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
      <EdgeInfoDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        currentEdgeInfo={currentEdgeInfo}
        edgeClusterTunnelInfo={sdLanData?.edgeClusterTunnelInfo}
        guestEdgeClusterTunnelInfo={sdLanData?.guestEdgeClusterTunnelInfo}
      />
    </>
  )
}
