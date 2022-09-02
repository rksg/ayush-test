import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPPool } from '@acx-ui/rc/utils'


export function PoolList (props:{
  poolData: DHCPPool[],
  updatePoolData: (data:DHCPPool[]) => void,
  showPoolForm: (data:DHCPPool) => void,
}) {

  const { $t } = useIntl()
  const { poolData, updatePoolData, showPoolForm } = props
  const [ errorVisible, updateVisible ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })

  const actions: TableProps<DHCPPool>['actions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPPool | DHCPPool[]) => {
        if (Array.isArray(rows)) {
          updateVisible(true)
        }else{
          showPoolForm(rows)
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPPool | DHCPPool[]) => {

        if (Array.isArray(rows)) {
          rows.forEach(item => {
            const index = poolData.findIndex(i => i.id === item.id)
            if (index !== -1) {
              poolData.splice(index, 1)
            }
          })
        } else {
          const index = poolData.findIndex(i => i.id === rows.id)
          if (index !== -1) {
            poolData.splice(index, 1)
          }
        }
        updatePoolData(poolData)
      }
    }
  ]

  const columns: TableProps<DHCPPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'mask',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Lease Time' }),
      width: 50,
      dataIndex: 'leaseTime'
    },
    {
      title: $t({ defaultMessage: 'Vlan' }),
      width: 50,
      dataIndex: 'vlan'
    },
    {
      title: $t({ defaultMessage: 'Number of hosts' }),
      width: 50,
      dataIndex: 'leaseTime'
    }
  ]
  return (
    <>
      {
        errorVisible &&
      <Alert message={$t(errorMessage)} type='error' showIcon closable />
      }
      <Table
        rowKey='id'
        style={{ width: '800px' }}
        columns={columns}
        dataSource={[...poolData]}
        type={'tall'}
        actions={actions}
        rowSelection={{ defaultSelectedRowKeys: [] }}
      />
    </>
  )
}
