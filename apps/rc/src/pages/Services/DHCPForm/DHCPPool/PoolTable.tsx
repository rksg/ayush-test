import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPPool } from '@acx-ui/rc/utils'

import { PoolAddButton } from '../styledComponents'



export function PoolTable (props:{
  poolData: DHCPPool[],
  updatePoolData?: (data:DHCPPool[]) => void,
  showPoolForm?: (data?:DHCPPool) => void,
  readonly?: Boolean
}) {

  const { $t } = useIntl()
  const { poolData, updatePoolData, showPoolForm, readonly=false } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })
  const actions: TableProps<DHCPPool>['actions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPPool | DHCPPool[]) => {
        if (Array.isArray(rows) && rows.length===1) {
          showPoolForm?.(rows[0])
        }else{
          showError(true)
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPPool | DHCPPool[], clearSelection) => {

        if (Array.isArray(rows)) {
          rows.forEach(item => {
            const index = poolData.findIndex(i => i.id === item.id)
            if (index !== -1) {
              poolData.splice(index, 1)
            }
          })
        }
        clearSelection()
        updatePoolData?.(poolData)
      }
    }
  ]

  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      width: 10,
      sorter: true
    },
    {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      width: 100,
      sorter: true
    },
    {
      key: 'mask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'mask',
      width: 100,
      sorter: true
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      width: 100,
      dataIndex: 'leaseTime',
      render: (data) =>{
        return data + ' Hours'
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'Vlan' }),
      width: 50,
      dataIndex: 'vlan'
    },
    {
      key: 'NumberOfHosts',
      title: $t({ defaultMessage: 'Number of hosts' }),
      width: 120,
      dataIndex: 'NumberOfhosts'
    }
  ]
  return (
    <>
      {
        errorVisible &&
      <Alert message={$t(errorMessage)} type='error' showIcon closable />
      }
      { !readonly && <div>
        <PoolAddButton
          onClick={()=>
            showPoolForm?.()
          }>{$t({ defaultMessage: 'Add DHCP Pool' })}</PoolAddButton>
      </div> }

      <Table
        rowKey='id'
        style={{ width: '800px' }}
        columns={columns}
        dataSource={[...poolData]}
        type={'tall'}
        actions={actions}
        rowSelection={readonly ? undefined : { defaultSelectedRowKeys: [] }}
      />
    </>
  )
}
