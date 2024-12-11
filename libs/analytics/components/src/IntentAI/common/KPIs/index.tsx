import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Card, GridCol, TrendPill } from '@acx-ui/components'

import { useIntentContext }                            from '../../IntentContext'
import { getGraphKPIs, IntentKpi, useIntentKpisQuery } from '../../useIntentDetailsQuery'
import { KpiField }                                    from '../KpiField'

import * as UI from './styledComponents'

export const KPICard: React.FC<{
  kpi: ReturnType<typeof getGraphKPIs>[number]
}> = ({ kpi }) => {
  const { $t } = useIntl()

  // TODO: show timestamps on hover
  return <Card>
    <UI.Title>{$t(kpi.label)}</UI.Title>
    <UI.Statistic
      title={kpi.footer}
      value={kpi.value}
      suffix={kpi.delta && <TrendPill {...kpi.delta} />}
    />
  </Card>
}

export const KPIGrid = () => {
  let { intent, kpis } = useIntentContext()
  const sanitisedKpis = kpis
    // pick only 2 required field
    // which its value is primitive value type
    // to prevent RTK Query unable to use param as cache key
    .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
  const query = useIntentKpisQuery({ ...intent, kpis: sanitisedKpis })

  const isDetectError = query.isError && !!_.pick(query.error, ['data'])

  const intentKpis = isDetectError ?
    (_.pick(query.error, ['data']) as { data: IntentKpi }).data
    : query.data
  intent = { ...intent, ...intentKpis }

  return <>
    {getGraphKPIs(intent, kpis).map(kpi => (
      <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
        <KPICard kpi={kpi} />
      </GridCol>
    ))}
  </>
}

export const KPIFields = () => {
  let { intent, kpis } = useIntentContext()
  const sanitisedKpis = kpis
    // pick only 2 required field
    // which its value is primitive value type
    // to prevent RTK Query unable to use param as cache key
    .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
  const query = useIntentKpisQuery({ ...intent, kpis: sanitisedKpis })

  const isDetectError = query.isError && !!_.pick(query.error, ['data'])

  const intentKpis = isDetectError ?
    (_.pick(query.error, ['data']) as { data: IntentKpi }).data
    : query.data
  intent = { ...intent, ...intentKpis }

  return <>
    {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
  </>
}
