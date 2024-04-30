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
      width: 240,
      fixed: 'left',
      defaultSortOrder: 'ascend'
    }, {
      key: 'vlans',
      title: $t({ defaultMessage: 'VLAN Range' }),
      dataIndex: 'vlans',
      sorter: true,
      width: 160
    }, {
      key: 'accessSwitches',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'accessSwitches',
      sorter: false,
      width: 240,
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
        dataIndex: 'loopbackInterfaceId',
        width: 80
      }, {
        key: 'loopbackInterfaceIp',
        title: <Table.SubTitle>{$t({ defaultMessage: 'IP Address' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceIp',
        width: 120
      }, {
        key: 'loopbackInterfaceSubnetMask',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Subnet Mask' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceSubnetMask',
        width: 120
      }]
    }, {
      key: 'siteKeepAlive',
      title: $t({ defaultMessage: 'Keep Alive' }),
      dataIndex: 'siteKeepAlive',
      sorter: true,
      width: 160
    }, {
      key: 'siteRetry',
      title: $t({ defaultMessage: 'Retry Times' }),
      dataIndex: 'siteRetry',
      sorter: true,
      width: 160
    }]
  }, [$t])
  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
