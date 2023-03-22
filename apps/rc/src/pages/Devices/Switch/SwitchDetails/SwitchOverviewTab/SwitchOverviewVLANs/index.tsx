import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  TableProps,
  Loader,
  Drawer,
  Table
} from '@acx-ui/components'
import { useGetVlanListBySwitchLevelQuery }                                                         from '@acx-ui/rc/services'
import { Vlan, transformTitleCase, useTableQuery, transformDisplayOnOff, SpanningTreeProtocolName } from '@acx-ui/rc/utils'

import { VlanDetail } from './vlanDetail'


export function SwitchOverviewVLANs () {
  const { $t } = useIntl()
  const [currentRow, setCurrentRow] = useState({} as Vlan)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const tableQuery = useTableQuery({
    useQuery: useGetVlanListBySwitchLevelQuery,
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
      render: (data, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentRow(row)
            setDrawerVisible(true)
          }}
        >
          {data}
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
      render: (data) => transformDisplayOnOff(data as boolean)
    }, {
      key: 'arpInspection',
      title: $t({ defaultMessage: 'ARP Inspection' }),
      dataIndex: 'arpInspection',
      sorter: true,
      render: (data) => transformDisplayOnOff(data as boolean)
    }, {
      key: 'igmpSnooping',
      title: $t({ defaultMessage: 'IGMP Snooping' }),
      dataIndex: 'igmpSnooping',
      sorter: true,
      render: (data) => transformTitleCase(data as string)
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
      render: (data) => {
        return data ? SpanningTreeProtocolName[data as keyof typeof SpanningTreeProtocolName] : null
      }
    }, {
      key: 'untaggedPorts',
      title: $t({ defaultMessage: 'Untagged Ports' }),
      dataIndex: 'untaggedPorts',
      ellipsis: false, //TODO: Need to check the root cause
      render: (data) => (
        <div style={{
          width: '200px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}>
          {data}
        </div>
      )
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
        mask={false}
        children={
          <VlanDetail
            row={currentRow}
          />
        }
      />

    </Loader>
  )
}
