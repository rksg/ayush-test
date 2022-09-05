import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Button,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPPool } from '@acx-ui/rc/utils'

const dataPool = {
  id: 0,
  name: '',
  allowWired: false,
  ip: '',
  mask: '',
  primaryDNS: '',
  secondaryDNS: '',
  dhcpOptions: [],
  leaseTime: 24,
  vlan: 300
}
export function PoolList (props:{
  poolData: DHCPPool[],
  updatePoolData: (data:DHCPPool[]) => void,
  showPoolForm: (data:DHCPPool) => void,
}) {

  const { $t } = useIntl()
  const { poolData, updatePoolData, showPoolForm } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })
  const style= {
    top: '36px',
    backgroundColor: 'transparent',
    right: '-650px',
    zIndex: '1',
    color: '#5496ea',
    fontWeight: 600,
    border: 0,
    cursor: 'pointer',
    fontSize: '12px'
  }
  const actions: TableProps<DHCPPool>['actions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPPool | DHCPPool[]) => {
        if (Array.isArray(rows) && rows.length===1) {
          showPoolForm(rows[0])
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
        } else {
          const index = poolData.findIndex(i => i.id === rows.id)
          if (index !== -1) {
            poolData.splice(index, 1)
          }
        }
        clearSelection()
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
      <div>
        <Button style={style}
          onClick={()=>
            showPoolForm(dataPool)
          }>{$t({ defaultMessage: 'Add DHCP Pool' })}</Button>
      </div>
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
