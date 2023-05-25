// import { useIntl } from 'react-intl'

import { DDoSRulesTable as DefaultDDoSRulesTable } from '@acx-ui/rc/components'
import {
  EdgeFirewallSetting
} from '@acx-ui/rc/utils'

interface DDoSRulesTableProps {
  firewallData: EdgeFirewallSetting | undefined;
}

export const DDoSRulesTable = (props: DDoSRulesTableProps) => {
  // const { $t } = useIntl()
  const { firewallData } = props
  const ddosRules = firewallData?.ddosRateLimitingRules

  // TODO: query statistic data and aggregate with rules.

  return (
    <DefaultDDoSRulesTable
      dataSource={ddosRules}
    />
  )
}