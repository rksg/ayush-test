import { useIntl } from 'react-intl'

import { Card, TrendPill } from '@acx-ui/components'

import { useIntentContext } from '../../IntentContext'
import { getGraphKPIs }     from '../../useIntentDetailsQuery'

import * as UI from './styledComponents'

export const KpiCard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()
  const { state } = useIntentContext()

  // TODO: show timestamps on hover
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <UI.Statistic
      $blur={state === 'no-data'}
      title={kpi.footer}
      value={kpi.value}
      suffix={kpi.delta && <TrendPill {...kpi.delta} />}
    />
  </Card>
}
