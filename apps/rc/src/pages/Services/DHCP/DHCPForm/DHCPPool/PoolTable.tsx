import { useState } from 'react'

import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { hasAccesses }         from '@acx-ui/rbac'
import { DHCPPool, LeaseUnit } from '@acx-ui/rc/utils'

export function PoolTable (props:{
  data: DHCPPool[]
  onAdd?: () => void
  onEdit?: (data?: DHCPPool) => void
  onDelete?: (data:DHCPPool[]) => void
  isDefaultService?: Boolean
}) {
  const { $t } = useIntl()
  const { data } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })

  const rowActions: TableProps<DHCPPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPPool[]) => {
        if (rows.length === 1) props.onEdit?.(rows[0])
        else showError(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPPool[], clearSelection) => {
        props.onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const countIpRangeSize = (startIpAddress: string, endIpAddress: string): number =>{
    const convertIpToLong = (ipAddress: string): number => {
      const ipArray = ipAddress.split('.').map(ip => parseInt(ip, 10))
      return ipArray[0] * 16777216 + ipArray[1] * 65536 + ipArray[2] * 256 + ipArray[3]
    }

    const startLong = convertIpToLong(startIpAddress)
    const endLong = convertIpToLong(endIpAddress)

    return endLong - startLong + 1
  }

  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'subnetAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'subnetAddress',
      sorter: true
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: true
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseTime',
      render: (data, row) =>{
        if(row.leaseUnit===LeaseUnit.HOURS){
          return <FormattedMessage defaultMessage='{number} Hours' values={{ number: data }} />
        }
        if(row.leaseUnit===LeaseUnit.MINUTES){
          return <FormattedMessage defaultMessage='{number} Minutes' values={{ number: data }} />
        }
        else {
          return ''
        }
      }
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'Vlan' }),
      dataIndex: 'vlanId'
    },
    {
      key: 'NumberOfHosts',
      title: $t({ defaultMessage: 'Number of hosts' }),
      dataIndex: 'subnetAddress',
      render: (_data, row) =>{
        return countIpRangeSize(row.startIpAddress, row.endIpAddress)
      }
    }
  ]
  let actions = [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    onClick: () => props.onAdd?.()
  }]
  return (
    <>
      {errorVisible && <Alert message={$t(errorMessage)} type='error' showIcon closable />}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowActions={hasAccesses(rowActions)}
        actions={hasAccesses(actions)}
        rowSelection={{}}
      />
    </>
  )
}
