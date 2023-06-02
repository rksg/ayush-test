import _ from 'lodash'

import { calculateGranularity }             from '@acx-ui/analytics/utils'
import { Loader }                           from '@acx-ui/components'
import { DDoSRuleStatisticDataTable }       from '@acx-ui/rc/components'
import { useGetEdgeFirewallDDoSStatsQuery } from '@acx-ui/rc/services'
import {
  DdosAttackType,
  DdosRateLimitingRule,
  DDoSRuleStatisticModel,
  EdgeFirewallSetting,
  expandDDoSAttackTypeAllRule
} from '@acx-ui/rc/utils'
import { DateRangeFilter } from '@acx-ui/utils'

interface DDoSRulesTableProps {
  firewallData: EdgeFirewallSetting | undefined;
  dateFilter: Omit<DateRangeFilter, 'range'>;
  edgeId: string;
  venueId: string;
}

export const DDoSRulesTable = (props: DDoSRulesTableProps) => {
  const { firewallData, dateFilter, edgeId, venueId } = props
  const ddosRules = firewallData?.ddosRateLimitingRules

  const { data: stats, isLoading }
    = useGetEdgeFirewallDDoSStatsQuery({ payload: {
      edgeId,
      venueId,
      start: dateFilter?.startDate,
      end: dateFilter?.endDate,
      granularity: calculateGranularity(dateFilter?.startDate, dateFilter?.endDate, 'PT15M')
    } })

  // query statistic data and aggregate with rules.
  // need to expand ddosAttackType.ALL to each type one by one
  const aggregated: DDoSRuleStatisticModel[] = ddosRules?.flatMap((rule:DdosRateLimitingRule) => {
    return rule.ddosAttackType === DdosAttackType.ALL
      ? expandDDoSAttackTypeAllRule(rule)
      : rule
  }).map((rule) => {
    const target = _.filter(stats, { attackType: rule.ddosAttackType })[0]
    return _.merge({ ...rule }, _.omit(target, ['attackType']))
  }) || [] as DDoSRuleStatisticModel[]

  return (
    <Loader states={[{ isLoading }]}>
      <DDoSRuleStatisticDataTable
        dataSource={aggregated}
      />
    </Loader>
  )
}