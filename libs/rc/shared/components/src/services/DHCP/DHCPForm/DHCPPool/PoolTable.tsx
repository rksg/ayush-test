import { useState } from 'react'

import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { defaultSort, DHCPPool, LeaseUnit, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess }                             from '@acx-ui/user'

export function PoolTable (props:{
  readonly?: boolean
  data: DHCPPool[]
  onAdd?: () => void
  onEdit?: (data?: DHCPPool) => void
  onDelete?: (data:DHCPPool[]) => void
  isDefaultService?: Boolean
}) {
  const { $t } = useIntl()
  const { data, readonly } = props
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

  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      fixed: 'left'
    },
    {
      key: 'subnetAddress',
      title: $t({ defaultMessage: 'Subnet Address' }),
      dataIndex: 'subnetAddress',
      sorter: { compare: sortProp('subnetAddress', defaultSort) }
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: { compare: sortProp('subnetMask', defaultSort) }
    },
    {
      key: 'startIpAddress',
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'startIpAddress',
      sorter: { compare: sortProp('startIpAddress', defaultSort) },
      render: function (_, row) {
        return $t({ defaultMessage: '{start} - {end}' },
          { start: row.startIpAddress, end: row.endIpAddress })
      }
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseTime',
      sorter: { compare: sortProp('leaseTime', defaultSort) },
      render: (_, row) =>{
        if(row.leaseUnit===LeaseUnit.HOURS){
          return <FormattedMessage
            defaultMessage='{number} Hours'
            values={{ number: row.leaseTime }}
          />
        }
        if(row.leaseUnit===LeaseUnit.MINUTES){
          return <FormattedMessage
            defaultMessage='{number} Minutes'
            values={{ number: row.leaseTime }}
          />
        }
        else {
          return ''
        }
      }
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'Vlan' }),
      dataIndex: 'vlanId',
      sorter: { compare: sortProp('vlanId', defaultSort) }
    },
    {
      key: 'NumberOfHosts',
      title: $t({ defaultMessage: 'Number of hosts' }),
      dataIndex: 'numberOfHosts',
      sorter: { compare: sortProp('numberOfHosts', defaultSort) }
    }
  ]
  let actions = [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    disabled: data.length>=4,
    onClick: () => props.onAdd?.()
  }]
  return (
    <>
      {errorVisible && <Alert message={$t(errorMessage)} type='error' showIcon closable />}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowActions={filterByAccess(rowActions)}
        actions={!readonly ? filterByAccess(actions) : undefined}
        rowSelection={!readonly ? {} : undefined}
      />
    </>
  )
}
