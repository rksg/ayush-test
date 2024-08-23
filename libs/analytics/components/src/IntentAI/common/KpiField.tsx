import React from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm, TrendPill } from '@acx-ui/components'

import { getGraphKPIs } from '../useIntentDetailsQuery'

export const KpiField: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  // TODO: show timestamps on hover
  return <div>
    <StepsForm.Subtitle children={$t(kpi.label)} />
    <Space align='center' size={5}>
      <span>{kpi.value}</span>
      {kpi.delta &&<TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend}
      />}
    </Space>
  </div>
}
