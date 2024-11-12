import { useIntl } from 'react-intl'

import { Table, TableProps }  from '@acx-ui/components'
import { DistributionSwitch } from '@acx-ui/rc/utils'

export const DistSwitchesTable = (props: Omit<TableProps<DistributionSwitch>, 'columns'>) => {

  const { $t } = useIntl()

  const columns: TableProps<DistributionSwitch>['columns'] = [
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      key: 'name',
      dataIndex: 'name',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'id',
      dataIndex: 'id'
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      key: 'accessSwitches',
      dataIndex: 'accessSwitches',
      render: (_, row) => {
        return row.accessSwitches?.map(as => `${as.name}`).join(', ')
      }
    },
    {
      title: $t({ defaultMessage: 'VLAN Range' }),
      key: 'vlans',
      dataIndex: 'vlans'
    }
  ]

  return (
    <Table {...props}
      columns={columns}
      rowKey='id'
    />
  )
}
