import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Card } from '@acx-ui/components'

import { getGraphKPIs } from '../../useIntentDetailsQuery'

import * as UI from './styledComponents'

export const KpiCard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <Space align='center' size={0}>
      <UI.Value>{kpi.value}</UI.Value>
      {/* TODO: fix: check kpi.delta before render */}
      {kpi.delta && <UI.TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend} />}
    </Space>
  </Card>
}
