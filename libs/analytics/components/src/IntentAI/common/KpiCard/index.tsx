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
}> = ({ kpi, showData }) => {
  const { $t } = useIntl()
  // TODO: show timestamps on hover
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <Space align='center' size={5}>
      {!showData
        ? <UI.Statistic
          value={kpi.value}
          suffix={kpi.delta && <TrendPill
            value={kpi.delta.value}
            trend={kpi.delta.trend} />}
        />
        : <UI.Statistic
          value={noDataDisplay}
          title={$t(dataRetentionText)} />}
    </Space>
  </Card>
}
