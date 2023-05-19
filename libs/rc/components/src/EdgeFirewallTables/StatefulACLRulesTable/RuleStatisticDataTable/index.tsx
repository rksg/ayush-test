import { useIntl } from 'react-intl'

import { TableProps }                             from '@acx-ui/components'
import { StatefulAclRule, defaultSort, sortProp } from '@acx-ui/rc/utils'

import { StatefulACLRulesTable, useDefaultColumns } from '..'

export interface StatefulAclRuleStatisticModel extends StatefulAclRule {
  hits: number;
  bytes: number;
}

export const RuleStatisticDataTable = ({ data }: { data: StatefulAclRuleStatisticModel[] }) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultColumns()
  const statisticColumns: TableProps<StatefulAclRule | StatefulAclRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hits' }),
      key: 'hits',
      dataIndex: 'hits',
      sorter: { compare: sortProp('hits', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Bytes' }),
      key: 'bytes',
      dataIndex: 'bytes',
      sorter: { compare: sortProp('bytes', defaultSort) }
    }
  ]

  return (
    <StatefulACLRulesTable
      columns={defaultColumns.concat(statisticColumns)}
      dataSource={data}
    />
  )
}