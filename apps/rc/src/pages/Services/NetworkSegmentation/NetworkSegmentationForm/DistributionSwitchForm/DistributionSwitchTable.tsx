import React from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }  from '@acx-ui/components'
import { DistributionSwitch } from '@acx-ui/rc/utils'


export function DistributionSwitchTable (props: Omit<TableProps<DistributionSwitch>, 'columns'>) {
  const { $t } = useIntl()

  const columns: TableProps<DistributionSwitch>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Dist. Switch' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'vlans',
      title: $t({ defaultMessage: 'VLAN Range' }),
      dataIndex: 'vlans',
      sorter: true
    }, {
      key: 'accessSwitches',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'accessSwitches',
      sorter: false,
      render: (_, row) => {
        return row.accessSwitches?.map(as => `${as.name}`).join(', ')
      }
    }, {
      key: 'loopbackInterface',
      title: $t({ defaultMessage: 'Loopback Interface' }),
      dataIndex: 'loopbackInterface',
      children: [{
        key: 'loopbackInterfaceId',
        title: <Table.SubTitle>{$t({ defaultMessage: 'ID' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceId'
      }, {
        key: 'loopbackInterfaceIp',
        title: <Table.SubTitle>{$t({ defaultMessage: 'IP Address' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceIp'
      }, {
        key: 'loopbackInterfaceSubnetMask',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Subnet Mask' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceSubnetMask'
      }]
    }, {
      key: 'siteKeepAlive',
      title: $t({ defaultMessage: 'Keep Alive' }),
      dataIndex: 'siteKeepAlive',
      sorter: true
    }, {
      key: 'siteRetry',
      title: $t({ defaultMessage: 'Retry Times' }),
      dataIndex: 'siteRetry',
      sorter: true
    }]
  }, [$t])
  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
