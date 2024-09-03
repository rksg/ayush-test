import React from 'react'

import { Form, Space } from 'antd'
import { useIntl }     from 'react-intl'

import { TrendPill } from '@acx-ui/components'

import { getGraphKPIs }      from '../useIntentDetailsQuery'
import { dataRetentionText } from '../utils'

export const KpiField: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
  showData:boolean
}> = ({ kpi, showData }) => {
  const { $t } = useIntl()
  // TODO: show timestamps on hover
  return <Form.Item label={$t(kpi.label)}>
    <Space align='center' size={5}>
      <span>{showData ? kpi.value : $t(dataRetentionText)}</span>
      {kpi.delta &&<TrendPill
        value={kpi.delta.value}
        trend={kpi.delta.trend}
      />}
    </Space>
  </Form.Item>
}
