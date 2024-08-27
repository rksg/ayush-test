import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Card, TrendPill } from '@acx-ui/components'

import { getGraphKPIs } from '../../useIntentDetailsQuery'

import * as UI from './styledComponents'

export const KpiCard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  // TODO: show timestamps on hover
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <Space align='center' size={5}>
      <UI.Value>{kpi.value}</UI.Value>
      {kpi.delta && <TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend} />}
    </Space>
  </Card>
}
