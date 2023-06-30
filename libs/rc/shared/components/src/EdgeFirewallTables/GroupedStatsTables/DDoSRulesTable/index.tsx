import _ from 'lodash'

import { calculateGranularity }             from '@acx-ui/analytics/utils'
import { Loader }                           from '@acx-ui/components'
import { useGetEdgeFirewallDDoSStatsQuery } from '@acx-ui/rc/services'
import {
  DdosAttackType,
  DdosRateLimitingRule,
  DDoSRuleStatisticModel,
  EdgeFirewallSetting,
  expandDDoSAttackTypeAllRule
} from '@acx-ui/rc/utils'
import { DateRangeFilter } from '@acx-ui/utils'

import { RuleStatisticDataTable as DDoSRuleStatisticDataTable } from '../../DDoSRulesTable/RuleStatisticDataTable'

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
    } }, {
      skip: !firewallData?.ddosRateLimitingEnabled
    })

  // query statistic data and aggregate with rules.
  // need to expand ddosAttackType.ALL to each type one by one
  // noticed that: display data only when DDoS enabled.
  const aggregated: DDoSRuleStatisticModel[] = firewallData?.ddosRateLimitingEnabled
    ? ddosRules?.flatMap((rule:DdosRateLimitingRule) => {
      return rule.ddosAttackType === DdosAttackType.ALL
        ? expandDDoSAttackTypeAllRule(rule)
        : rule
    }).map((rule) => {
      const target = _.filter(stats, { ddosAttackType: rule.ddosAttackType })[0]
      return _.merge({ ...rule }, target)
    }) || [] as DDoSRuleStatisticModel[]
    : [] as DDoSRuleStatisticModel[]

  return (
    <Loader states={[{ isLoading }]}>
      <DDoSRuleStatisticDataTable
        dataSource={aggregated}
      />
    </Loader>
  )
}