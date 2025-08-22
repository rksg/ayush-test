import { useState } from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { Loader }                     from '@acx-ui/components'
import { Table, TableProps }          from '@acx-ui/components'
import { OltPort, OltPortStatusEnum } from '@acx-ui/olt/utils'
import { sortProp, defaultSort }      from '@acx-ui/rc/utils'
// import { TenantLink }                                             from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'

import { OltStatus }            from '../../../OltStatus'
import { EditUplinkPortDrawer } from '../EditUplinkPortDrawer'
import { ManageLacpLagDrawer }  from '../ManageLacpLagDrawer'

export const data = [
  {
    port: 'S1/1',
    status: 'up',
    speed: '1',
    vlanId: '200'
  },
  {
    port: 'S1/2',
    status: 'up',
    speed: '1',
    vlanId: '200'
  },
  {
    port: 'S1/3',
    status: 'down',
    speed: 'link down',
    vlanId: '200'
  }
] as OltPort[]

export const OltUplinkPortTable = () => {
  const { $t } = useIntl()
  const isLoading = false // TODO
  const isFetching = false // TODO
  // const { data, isLoading, isFetching } = useGetEdgeMdnsProxyQuery(
  //   { params: { serviceId } },
  //   { skip: !serviceId || !visible }
  // )
  const [editPortData, setEditPortData] = useState<OltPort | null>(null)
  const [editUplinkPortDrawerVisible, setEditUplinkPortDrawerVisible] = useState(false)
  const [manageLacpLagDrawerVisible, setManageLacpLagDrawerVisible] = useState(false)


  const columns: TableProps<OltPort>['columns'] = [
    {
      key: 'port',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'port',
      sorter: { compare: sortProp('port', defaultSort) } ,
      // searchable: true,
      fixed: 'left',
      render: (_, row) => row.port
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      defaultSortOrder: 'descend',
      sorter: { compare: sortProp('status', defaultSort) },
      // filterable: true,
      width: 80,
      render: (_, row) =>
        <OltStatus type='port' status={row.status} showText />
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speed',
      dataIndex: 'speed',
      width: 80,
      render: (_, row) => row.status === OltPortStatusEnum.UP
        ? `${get(row, 'speed')} Gb/sec`
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'VLAN ID' }),
      key: 'vlanId',
      dataIndex: 'vlanId',
      width: 80,
      render: (_, row) => row.vlanId
    }
  ]



  const rowActions: TableProps<OltPort>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      // rbacOpsIds: ,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: (rows) => { // TODO: edit cage
        setEditPortData(rows[0])
        setEditUplinkPortDrawerVisible(true)
      }
    }
  ]



  return <Loader
    states={[{ isLoading, isFetching }]}
    style={{ minHeight: '100px', backgroundColor: 'transparent' }}
  >
    <Table
      rowKey='port'
      columns={columns}
      // for resolving flashing issue while doing tab switch
      style={{ minHeight: '300px' }}
      dataSource={data}
      rowActions={filterByAccess(rowActions)}
      rowSelection={{ type: 'checkbox' }}
      actions={filterByAccess([{
        label: $t({ defaultMessage: 'Manage LACP LAG' }),
        onClick: () => { setManageLacpLagDrawerVisible(true) }
      }])}
    />
    <EditUplinkPortDrawer
      data={editPortData}
      visible={editUplinkPortDrawerVisible}
      setVisible={setEditUplinkPortDrawerVisible}
    />
    <ManageLacpLagDrawer
      visible={manageLacpLagDrawerVisible}
      setVisible={setManageLacpLagDrawerVisible}
    />
  </Loader>
}