import React from 'react'

import { Form, Space } from 'antd'
import { useIntl }     from 'react-intl'

import { TrendPill } from '@acx-ui/components'

import { useIntentContext } from '../IntentContext'
import { getGraphKPIs }     from '../useIntentDetailsQuery'

export const KpiField: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  const { isDataRetained, isHotTierData } = useIntentContext()
  // TODO: show timestamps on hover
  return <Form.Item label={$t(kpi.label)}>
    <Space align='center' size={5}>
      <span>{(isDataRetained && isHotTierData) ? kpi.value : kpi.footer}</span>
      {kpi.delta && <TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend}
      />}
    </Space>
  </Form.Item>
}
