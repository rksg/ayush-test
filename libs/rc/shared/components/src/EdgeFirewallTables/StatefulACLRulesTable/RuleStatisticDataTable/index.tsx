import { QuestionCircleOutlined }   from '@ant-design/icons'
import { Empty, Space, Typography } from 'antd'
import { useIntl }                  from 'react-intl'

import { TableProps, Tooltip } from '@acx-ui/components'
import { formatter }           from '@acx-ui/formatter'
import {
  StatefulAclRule,
  defaultSort,
  sortProp,
  FirewallACLRuleStatisticModel,
  transformDisplayText
} from '@acx-ui/rc/utils'

import { StatefulACLRulesTable, useDefaultStatefulACLRulesColumns } from '..'

export const RuleStatisticDataTable = ({ dataSource }:
   { dataSource: FirewallACLRuleStatisticModel[] }) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultStatefulACLRulesColumns()
  const statisticColumns: TableProps<StatefulAclRule | FirewallACLRuleStatisticModel>['columns'] = [
    {
      title: <Space size={3}>
        <Typography.Text>
          {$t({ defaultMessage: 'Hits' })}
        </Typography.Text>
        <Tooltip
          placement='topRight'
          title={
            $t({ defaultMessage: 'Hit counts would be cleared when the rule has any changes' })
          }
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>,
      key: 'packets',
      dataIndex: 'packets',
      sorter: { compare: sortProp('packets', defaultSort) },
      render: (_, row) => transformDisplayText(
        (row as FirewallACLRuleStatisticModel).packets?.toString())
    },
    {
      title: <Space size={3}>
        <Typography.Text>
          {$t({ defaultMessage: 'Bytes' })}
        </Typography.Text>
        <Tooltip
          placement='topRight'
          title={
            $t({ defaultMessage: 'Byte counts would be cleared when the rule has any changes' })
          }
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>,
      key: 'bytes',
      dataIndex: 'bytes',
      sorter: { compare: sortProp('bytes', defaultSort) },
      render: (_, row) => {
        const val = (row as FirewallACLRuleStatisticModel).bytes
        return transformDisplayText(val
          ? formatter('bytesFormat')(Number(val))
          : val?.toString())
      }
    }
  ]

  return (
    <StatefulACLRulesTable
      columns={defaultColumns.concat(statisticColumns)}
      dataSource={dataSource}
      locale={{
        emptyText: <Empty description={$t({ defaultMessage: 'No data' })} />
      }}
    />
  )
}
