import _ from 'lodash'

import { calculateGranularity }              from '@acx-ui/analytics/utils'
import { Loader }                            from '@acx-ui/components'
import { StatefulACLRuleStatisticDataTable } from '@acx-ui/rc/components'
import { useGetEdgeFirewallACLStatsQuery }   from '@acx-ui/rc/services'
import {
  ACLDirection,
  EdgeFirewallSetting,
  FirewallACLRuleStatisticModel } from '@acx-ui/rc/utils'
import { DateRangeFilter } from '@acx-ui/utils'

interface StatefulACLRulesTableProps {
  firewallData: EdgeFirewallSetting | undefined;
  direction: ACLDirection;
  dateFilter: Omit<DateRangeFilter, 'range'>;
  edgeId: string;
  venueId: string;
}

const testStatsData = {
  direction: ACLDirection.OUTBOUND,
  permittedSessions: 100,
  aclRuleStatsList: [
    {
      priority: 1,
      packets: 12,
      bytes: 72
    },
    {
      priority: 2,
      packets: 9,
      bytes: 168
    }
  ]
}

export const StatefulACLRulesTable = (props: StatefulACLRulesTableProps) => {
  const { firewallData, direction, dateFilter, edgeId, venueId } = props
  const acls = firewallData?.statefulAcls
  const aclRules = _.find(acls, { direction })?.rules

  const { data: stats = testStatsData, isLoading }
    = useGetEdgeFirewallACLStatsQuery({ payload: {
      edgeId,
      venueId,
      start: dateFilter?.startDate,
      end: dateFilter?.endDate,
      granularity: calculateGranularity(dateFilter?.startDate, dateFilter?.endDate, 'PT15M'),
      direction
    } })

  const statsData = stats.direction === direction ? stats.aclRuleStatsList : []

  // query statistic data and aggregate with rules.
  const aggregated: FirewallACLRuleStatisticModel[] = aclRules?.map((rule) => {
    const target = _.filter(statsData, { priority: rule.priority })[0]
    return _.merge({ ...rule }, target)
  }) as FirewallACLRuleStatisticModel[]

  return (
    <Loader states={[{ isLoading }]}>
      <StatefulACLRuleStatisticDataTable
        dataSource={aggregated}
        // pagination={{
        //   pageSize: 5,
        //   defaultPageSize: 5
        // }}
      />
    </Loader>
  )
}