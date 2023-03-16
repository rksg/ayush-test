
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { ApSnmpViewModelData }    from '@acx-ui/rc/utils'

import { renderToListTooltip } from '../SnmpAgentTable/SnmpAgentTable'

export default function SnmpAgentOverview (props: { snmpData: ApSnmpViewModelData }) {
  const intl = useIntl()
  const { $t } = intl
  const { v2Agents, v3Agents } = props?.snmpData || {}

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'SNMPv2 Agent' })}
          </Card.Title>
          <Typography.Text>{ renderToListTooltip(intl, v2Agents) }</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'SNMPv3 Agent' })}
          </Card.Title>
          <Typography.Text>{ renderToListTooltip(intl, v3Agents) }</Typography.Text>
        </GridCol>
      </GridRow>
    </Card>
  )
}
