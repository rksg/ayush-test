import React from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { TrendTypeEnum }        from '@acx-ui/analytics/utils'
import { StepsForm, TrendPill } from '@acx-ui/components'

import { getGraphKPIs } from '../useIntentDetailsQuery'

export const KpiField: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  return <div>
    <StepsForm.Subtitle children={$t(kpi.label)} />
    <Space align='center' size={5}>
      <span>{kpi.after}</span>
      {/* TODO: fix: check kpi.delta before render */}
      <TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend as TrendTypeEnum}
      />
    </Space>
  </div>
}
