import { useIntl } from 'react-intl'

import { Table, TableProps }                                                                         from '@acx-ui/components'
import { defaultSort, sortProp, DdosRateLimitingRule, DDoSRuleStatisticModel, transformDisplayText } from '@acx-ui/rc/utils'

import { DDoSRulesTable, useDefaultDDoSRulesColumns } from '..'

export const RuleStatisticDataTable = ({ dataSource }:
   { dataSource: DDoSRuleStatisticModel[] }) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultDDoSRulesColumns()

  const statisticColumns: TableProps<DdosRateLimitingRule | DDoSRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hits' }),
      key: 'hit',
      dataIndex: 'hit',
      children: [{
        key: 'deniedPackets',
        dataIndex: 'deniedPackets',
        title: <Table.SubTitle>
          {$t({ defaultMessage: 'Denied Packet' })}
        </Table.SubTitle>,
        align: 'center',
        sorter: { compare: sortProp('deniedPackets', defaultSort) },
        render: (data, row) => transformDisplayText(
          (row as DDoSRuleStatisticModel).deniedPackets?.toString())
      },{
        key: 'passedPackets',
        dataIndex: 'passedPackets',
        title: <Table.SubTitle>
          {$t({ defaultMessage: 'Pass Packet' })}
        </Table.SubTitle>,
        align: 'center',
        sorter: { compare: sortProp('passedPackets', defaultSort) },
        render: (data, row) => transformDisplayText(
          (row as DDoSRuleStatisticModel).passedPackets?.toString())
      }]
    }
  ]

  return (
    <DDoSRulesTable
      columns={defaultColumns.concat(statisticColumns)}
      dataSource={dataSource}
    />
  )
}