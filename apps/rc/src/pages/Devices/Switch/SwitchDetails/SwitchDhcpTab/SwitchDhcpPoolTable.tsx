import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import {
  useSwitchDetailHeaderQuery,
  useGetDhcpPoolsQuery,
  useDeleteDhcpServersMutation
} from '@acx-ui/rc/services'
import { useTableQuery, SwitchDhcp, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useParams }                                   from '@acx-ui/react-router-dom'


import { AddPoolDrawer } from './AddPoolDrawer'


export function SwitchDhcpPoolTable () {
  const { $t } = useIntl()
  const params = useParams()
  const { data: switchDetail } = useSwitchDetailHeaderQuery({ params })
  const [ deleteDhcpServers ] = useDeleteDhcpServersMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetDhcpPoolsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'poolName',
      sortOrder: 'ASC'
    }
  })

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selected, setSelected] = useState<SwitchDhcp>()

  const columns: TableProps<SwitchDhcp>['columns'] = [
    {
      key: 'poolName',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'poolName',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'subnetAddress',
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'subnetAddress',
      sorter: false
    }, {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: false
    }, {
      key: 'leaseDays',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseDays',
      sorter: false
    }, {
      key: 'defaultRouterIp',
      title: $t({ defaultMessage: 'Default Router IP' }),
      dataIndex: 'defaultRouterIp',
      sorter: true
    }
  ]

  const rowActions: TableProps<SwitchDhcp>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected(selectedRows[0])
        setDrawerVisible(true)
      }
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows) => {
        deleteDhcpServers({ params, payload: selectedRows.map(r=>r.id) })
        setSelected(undefined)
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        actions={[{
          label: $t({ defaultMessage: 'Add Pool' }),
          disabled: switchDetail?.deviceStatus !== SwitchStatusEnum.OPERATIONAL,
          onClick: () => setDrawerVisible(true)
        }]}
        rowKey='poolName'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }} />
      <AddPoolDrawer
        visible={drawerVisible}
        editPool={selected}
        onSavePool={()=>{}}
        onClose={()=>setDrawerVisible(false)}
      />
    </Loader>
  )
}