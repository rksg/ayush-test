import { useIntl } from 'react-intl'

import { TableProps }                                  from '@acx-ui/components'
import { defaultSort, sortProp, DdosRateLimitingRule } from '@acx-ui/rc/utils'

import { DDoSRulesTable, useDefaultColumns } from '..'

export interface DDoSRuleStatisticModel extends DdosRateLimitingRule {
  deniedPacket: number;
  passPacket: number;
}

export const RuleStatisticDataTable = ({ data }: { data: DDoSRuleStatisticModel[] }) => {
  const { $t } = useIntl()
  const defaultColumns = useDefaultColumns()
  const statisticColumns: TableProps<DdosRateLimitingRule | DDoSRuleStatisticModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Denied Packet' }),
      key: 'deniedPacket',
      dataIndex: 'deniedPacket',
      sorter: { compare: sortProp('deniedPacket', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Pass Packet' }),
      key: 'passPacket',
      dataIndex: 'passPacket',
      sorter: { compare: sortProp('passPacket', defaultSort) }
    }
  ]

  return (
    <DDoSRulesTable
      columns={defaultColumns.concat(statisticColumns)}
      dataSource={data}
    />
  )
}