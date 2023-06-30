import { Empty }   from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import {
  DdosRateLimitingRule,
  DDoSRuleStatisticModel,
  defaultSort,
  getDDoSAttackTypeString,
  sortProp
} from '@acx-ui/rc/utils'


interface DDoSRulesTableProps
  extends Omit<TableProps<DdosRateLimitingRule | DDoSRuleStatisticModel>,
  'rowKey' | 'columns'> {
    // custom column is optional
    columns?: TableProps<DdosRateLimitingRule | DDoSRuleStatisticModel>['columns']
  }

export function useDefaultDDoSRulesColumns () {
  const { $t } = useIntl()
  const columns: TableProps<DdosRateLimitingRule | DDoSRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'DDoS Attack Type' }),
      key: 'ddosAttackType',
      dataIndex: 'ddosAttackType',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('ddosAttackType', defaultSort) },
      render: (_, row) => {
        return getDDoSAttackTypeString($t, row.ddosAttackType)
      }
    },
    {
      title: $t({ defaultMessage: 'Rate-limit Value' }),
      key: 'rateLimiting',
      dataIndex: 'rateLimiting',
      sorter: { compare: sortProp('rateLimiting', defaultSort) }
    }
  ]
  return columns
}

export const DDoSRulesTable = (props: DDoSRulesTableProps) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultDDoSRulesColumns()
  const { dataSource, columns, ...otherProps } = props

  return (
    <Table
      columns={columns ?? defaultColumns}
      dataSource={dataSource}
      rowKey='ddosAttackType'
      locale={{
        emptyText: <Empty description={$t({ defaultMessage: 'No rules created yet' })} />
      }}
      {...otherProps}
    />
  )
}