import { Space } from 'antd'
import _         from 'lodash'

import { calculateGranularity }            from '@acx-ui/analytics/utils'
import { Loader }                          from '@acx-ui/components'
import { useGetEdgeFirewallACLStatsQuery } from '@acx-ui/rc/services'
import {
  ACLDirection,
  EdgeFirewallSetting,
  FirewallACLRuleStatisticModel } from '@acx-ui/rc/utils'
import { DateRangeFilter } from '@acx-ui/utils'

import { RuleStatisticDataTable as ACLRuleStatisticDataTable } from '../../StatefulACLRulesTable/RuleStatisticDataTable'

import { ACLOtherInfoTable } from './ACLOtherInfoTable'

interface StatefulACLRulesTableProps {
  firewallData: EdgeFirewallSetting | undefined;
  direction: ACLDirection;
  dateFilter: Omit<DateRangeFilter, 'range'>;
  edgeId: string;
  venueId: string;
  displayOtherInfo?: boolean
}

export const StatefulACLRulesTable = (props: StatefulACLRulesTableProps) => {
  const {
    firewallData,
    direction,
    dateFilter,
    edgeId,
    venueId,
    displayOtherInfo = false
  } = props
  const acls = firewallData?.statefulAcls
  const aclRules = _.find(acls, { direction })?.rules

  const { data: stats, isLoading }
    = useGetEdgeFirewallACLStatsQuery({ payload: {
      edgeId,
      venueId,
      start: dateFilter?.startDate,
      end: dateFilter?.endDate,
      granularity: calculateGranularity(dateFilter?.startDate, dateFilter?.endDate, 'PT15M'),
      direction
    } })

  const statsData = stats?.direction === direction ? stats.aclRuleStatsList : []

  // query statistic data and aggregate with rules.
  const aggregated: FirewallACLRuleStatisticModel[] = aclRules?.map((rule) => {
    const target = _.filter(statsData, { priority: rule.priority })[0]
    return _.merge({ ...rule }, target)
  }) as FirewallACLRuleStatisticModel[]

  return (
    <Loader states={[{ isLoading }]}>
      <Space size='large' direction='vertical'>
        {displayOtherInfo &&
        <ACLOtherInfoTable stats={stats} />
        }

        <ACLRuleStatisticDataTable
          dataSource={aggregated}
        />
      </Space>
    </Loader>
  )
}