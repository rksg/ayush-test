
import { useIntl } from 'react-intl'

import { SummaryCard }         from '@acx-ui/components'
import { ApSnmpViewModelData } from '@acx-ui/rc/utils'

import { renderToListTooltip } from '../SnmpAgentTable/SnmpAgentTable'

export default function SnmpAgentOverview (props: { snmpData: ApSnmpViewModelData }) {
  const intl = useIntl()
  const { $t } = intl
  const { v2Agents, v3Agents } = props?.snmpData || {}
  const snmpAgentInfo = [
    {
      title: $t({ defaultMessage: 'SNMPv2 Agent' }),
      content: renderToListTooltip(intl, v2Agents)
    },
    {
      title: $t({ defaultMessage: 'SNMPv3 Agent' }),
      content: renderToListTooltip(intl, v3Agents)
    }
  ]

  return <SummaryCard data={snmpAgentInfo} />
}
