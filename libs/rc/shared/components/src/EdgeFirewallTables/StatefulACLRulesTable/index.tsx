import { Empty }   from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import {
  FirewallACLRuleStatisticModel,
  getAccessActionString,
  getProtocolTypeString,
  ProtocolType,
  StatefulAclRule
} from '@acx-ui/rc/utils'

import { getRuleSrcDstString } from './utils'


interface StatefulACLRulesTableProps
  extends Omit<TableProps<StatefulAclRule | FirewallACLRuleStatisticModel>,
  'rowKey' | 'columns'> {
    // custom column is optional
    columns?: TableProps<StatefulAclRule | FirewallACLRuleStatisticModel>['columns']
  }

export const useDefaultStatefulACLRulesColumns = () => {
  const { $t } = useIntl()

  const columns: TableProps<StatefulAclRule | FirewallACLRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      defaultSortOrder: 'ascend',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      width: 150
    },
    {
      title: $t({ defaultMessage: 'Access' }),
      key: 'accessAction',
      dataIndex: 'accessAction',
      render: (_, row) => {
        return getAccessActionString($t, row.accessAction)
      }
    },
    {
      title: $t({ defaultMessage: 'Source' }),
      key: 'source',
      dataIndex: 'source',
      render: (_, row) => {
        return getRuleSrcDstString(row, true)
      }
    },
    {
      title: $t({ defaultMessage: 'Src Port' }),
      key: 'sourcePort',
      dataIndex: 'sourcePort'
    },
    {
      title: $t({ defaultMessage: 'Destination' }),
      key: 'destination',
      dataIndex: 'destination',
      render: (_, row) => {
        return getRuleSrcDstString(row, false)
      }
    },
    {
      title: $t({ defaultMessage: 'Dst Port' }),
      key: 'destinationPort',
      dataIndex: 'destinationPort'
    },
    {
      title: $t({ defaultMessage: 'Protocol' }),
      key: 'protocolType',
      dataIndex: 'protocolType',
      render: (_, row) => {
        return getProtocolTypeString($t, row.protocolType)
         + (row.protocolType === ProtocolType.CUSTOM ? ` (${row.protocolValue})` : '')
      }
    }
  ]
  return columns
}

export const StatefulACLRulesTable = (props: StatefulACLRulesTableProps) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultStatefulACLRulesColumns()
  const { dataSource, columns, ...otherProps } = props

  return (
    <Table
      columns={columns ?? defaultColumns}
      dataSource={dataSource}
      rowKey='priority'
      locale={{
        emptyText: <Empty description={$t({ defaultMessage: 'No rules created yet' })} />
      }}
      {...otherProps}
    />
  )
}
