import { useIntl } from 'react-intl'

import { TableProps }                                                                                  from '@acx-ui/components'
import { StatefulAclRule, defaultSort, sortProp, FirewallACLRuleStatisticModel, transformDisplayText } from '@acx-ui/rc/utils'

import { StatefulACLRulesTable, useDefaultStatefulACLRulesColumns } from '..'

export const RuleStatisticDataTable = ({ dataSource }:
   { dataSource: FirewallACLRuleStatisticModel[] }) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultStatefulACLRulesColumns()
  const statisticColumns: TableProps<StatefulAclRule | FirewallACLRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hits' }),
      key: 'packets',
      dataIndex: 'packets',
      sorter: { compare: sortProp('packets', defaultSort) },
      render: (data, row) => transformDisplayText(
        (row as FirewallACLRuleStatisticModel).packets?.toString())
    },
    {
      title: $t({ defaultMessage: 'Bytes' }),
      key: 'bytes',
      dataIndex: 'bytes',
      sorter: { compare: sortProp('bytes', defaultSort) },
      render: (data, row) => transformDisplayText(
        (row as FirewallACLRuleStatisticModel).bytes?.toString())
    }
  ]

  return (
    <StatefulACLRulesTable
      columns={defaultColumns.concat(statisticColumns)}
      dataSource={dataSource}
    />
  )
}