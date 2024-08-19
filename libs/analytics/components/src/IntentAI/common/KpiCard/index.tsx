import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { TrendTypeEnum } from '@acx-ui/analytics/utils'
import { Card }          from '@acx-ui/components'

import { getGraphKPIs } from '../../IntentAIForm/services'

import * as UI from './styledComponents'

export const KpiCard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <Space align='center' size={0}>
      <UI.Value>{kpi.after}</UI.Value>
      {/* TODO: fix: check kpi.delta before rendder */}
      <UI.TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend as TrendTypeEnum} />
    </Space>
  </Card>
}
