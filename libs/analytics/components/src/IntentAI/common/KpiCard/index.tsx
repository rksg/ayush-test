import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Card, TrendPill } from '@acx-ui/components'
import { noDataDisplay }   from '@acx-ui/utils'

import { getGraphKPIs }      from '../../useIntentDetailsQuery'
import { dataRetentionText } from '../../utils'


import * as UI from './styledComponents'

export const KpiCard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
  showData: boolean
  blurData: boolean
}> = ({ kpi, showData, blurData }) => {
  const { $t } = useIntl()
  // showData = false
  // TODO: show timestamps on hover
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <Space align='center' size={5}>
      <UI.Statistic
        title={!showData && $t(dataRetentionText)}
        value={showData ? kpi.value : noDataDisplay}
        suffix={showData && kpi.delta &&
        <TrendPill
          value={kpi.delta.value}
          trend={kpi.delta.trend}
        />}
        style={{
          filter: blurData ? 'blur(8px)' : 'none'
        }}
      />
    </Space>
  </Card>
}
