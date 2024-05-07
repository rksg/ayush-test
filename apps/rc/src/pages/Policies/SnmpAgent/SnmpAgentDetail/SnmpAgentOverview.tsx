
import { useIntl } from 'react-intl'

import { SummaryCard }          from '@acx-ui/components'
import { CountAndNamesTooltip } from '@acx-ui/rc/components'
import { ApSnmpViewModelData }  from '@acx-ui/rc/utils'

export default function SnmpAgentOverview (props: { snmpData: ApSnmpViewModelData }) {
  const { $t } = useIntl()
  const { v2Agents, v3Agents } = props.snmpData || {}
  const snmpAgentInfo = [
    {
      title: $t({ defaultMessage: 'SNMPv2 Agent' }),
      content: <CountAndNamesTooltip data={v2Agents} maxShow={25} />
    },
    {
      title: $t({ defaultMessage: 'SNMPv3 Agent' }),
      content: <CountAndNamesTooltip data={v3Agents} maxShow={25} />
    }
  ]

  return <SummaryCard data={snmpAgentInfo} />
}
