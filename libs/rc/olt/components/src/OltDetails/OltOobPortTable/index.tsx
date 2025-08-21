import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader }                from '@acx-ui/components'
import { Table, TableProps }     from '@acx-ui/components'
import { OltPort }               from '@acx-ui/olt/utils'
import { sortProp, defaultSort } from '@acx-ui/rc/utils'
// import { TenantLink }                                             from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { OltStatus }         from '../../OltStatus'
import { EditOobPortDrawer } from '../EditOobPortDrawer'


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

export const OltOobPortTable = () => {
  const { $t } = useIntl()
  const isLoading = false // TODO
  const isFetching = false // TODO
  // const { data, isLoading, isFetching } = useGetEdgeMdnsProxyQuery(
  //   { params: { serviceId } },
  //   { skip: !serviceId || !visible }
  // )
  const [editPortData, setEditPortData] = useState<OltPort | null>(null)
  const [editOobPortDrawerVisible, setEditOobPortDrawerVisible] = useState(false)


  const columns: TableProps<OltPort>['columns'] = [
    {
      key: 'port',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'port',
      sorter: { compare: sortProp('port', defaultSort) } ,
      width: 80,
      fixed: 'left',
      render: (_, row) => row.port
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      defaultSortOrder: 'descend',
      sorter: { compare: sortProp('status', defaultSort) },
      width: 80,
      render: (_, row) =>
        <OltStatus type='port' status={row.status} showText />
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
        setEditOobPortDrawerVisible(true)
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

    />
    <EditOobPortDrawer
      data={editPortData}
      visible={editOobPortDrawerVisible}
      setVisible={setEditOobPortDrawerVisible}
    />
  </Loader>
}