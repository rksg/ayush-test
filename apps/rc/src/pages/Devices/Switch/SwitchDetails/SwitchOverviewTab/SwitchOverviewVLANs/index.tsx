import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  TableProps,
  Loader,
  Drawer,
  Table
} from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { useGetVlanListBySwitchLevelQuery } from '@acx-ui/rc/services'
import {
  Vlan,
  transformTitleCase,
  useTableQuery,
  transformDisplayOnOff,
  SpanningTreeProtocolName,
  SwitchViewModel
} from '@acx-ui/rc/utils'

import { VlanDetail } from './vlanDetail'


export function SwitchOverviewVLANs (props: {
  switchDetail?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const { switchDetail } = props
  const [currentRow, setCurrentRow] = useState({} as Vlan)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const tableQuery = useTableQuery({
    useQuery: useGetVlanListBySwitchLevelQuery,
    enableRbac: isSwitchRbacEnabled,
    apiParams: { venueId: (switchDetail?.venueId || '') as string },
    defaultPayload: {},
    sorter: {
      sortField: 'vlanId',
      sortOrder: 'ASC'
    }
  })

  const onClose = () => {
    setDrawerVisible(false)
  }

  const columns: TableProps<Vlan>['columns'] = [
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN #' }),
      dataIndex: 'vlanId',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentRow(row)
            setDrawerVisible(true)
          }}
        >
          {row.vlanId}
        </Button>
    }, {
      key: 'vlanName',
      title: $t({ defaultMessage: 'VLAN Name' }),
      sorter: true,
      dataIndex: 'vlanName'
    }, {
      key: 'ipv4DhcpSnooping',
      title: $t({ defaultMessage: 'IPv4 DHCP Snooping' }),
      dataIndex: 'ipv4DhcpSnooping',
      sorter: true,
      render: (_, { ipv4DhcpSnooping }) => transformDisplayOnOff(Boolean(ipv4DhcpSnooping))
    }, {
      key: 'arpInspection',
      title: $t({ defaultMessage: 'ARP Inspection' }),
      dataIndex: 'arpInspection',
      sorter: true,
      render: (_, { arpInspection }) => transformDisplayOnOff(Boolean(arpInspection))
    }, {
      key: 'igmpSnooping',
      title: $t({ defaultMessage: 'IGMP Snooping' }),
      dataIndex: 'igmpSnooping',
      sorter: true,
      render: (_, { igmpSnooping }) => transformTitleCase(igmpSnooping as string)
    }, {
      key: 'multicastVersion',
      title: $t({ defaultMessage: 'Multicast Version' }),
      sorter: true,
      dataIndex: 'multicastVersion'
    }, {
      key: 'spanningTreeProtocol',
      title: $t({ defaultMessage: 'Spanning Tree' }),
      dataIndex: 'spanningTreeProtocol',
      sorter: true,
      render: (_, { spanningTreeProtocol }) => {
        return spanningTreeProtocol ? SpanningTreeProtocolName[spanningTreeProtocol] : null
      }
    }, {
      key: 'untaggedPorts',
      title: $t({ defaultMessage: 'Untagged Ports' }),
      dataIndex: 'untaggedPorts'
    }, {
      key: 'taggedPorts',
      title: $t({ defaultMessage: 'Tagged Ports' }),
      dataIndex: 'taggedPorts'
    }

  ]
  return (
    <Loader
      states={[tableQuery]}
    >
      <Table
        columns={columns}
        type='tall'
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={tableQuery.data?.data}
        rowKey='vlanId'
      />


      <Drawer
        title={$t({ defaultMessage: 'View VLAN' })}
        visible={drawerVisible}
        onClose={onClose}
        children={
          <VlanDetail
            row={currentRow}
          />
        }
      />

    </Loader>
  )
}
