import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Card, GridCol, TrendPill, Loader } from '@acx-ui/components'

import { useIntentContext }                            from '../../IntentContext'
import { getGraphKPIs, IntentKPI, useIntentKPIsQuery } from '../../useIntentDetailsQuery'
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
  const { intent, kpis } = useIntentContext()
  const sanitisedKPIs = kpis
    // pick only 2 required field
    // which its value is primitive value type
    // to prevent RTK Query unable to use param as cache key
    .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
  const query = useIntentKPIsQuery({ ...intent, kpis: sanitisedKPIs }, { skip: kpis.length === 0 })

  const isDetectError = query.isError && !!_.pick(query.error, ['data'])

  const intentKPIs = isDetectError ?
    (_.pick(query.error, ['data']) as { data: IntentKPI }).data
    : query.data

  return <Loader states={[isDetectError? _.omit(query, ['error']) : query]}>
    {getGraphKPIs({ ...intent, ...intentKPIs }, kpis).map(kpi => (
      <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
        <KPICard kpi={kpi} />
      </GridCol>
    ))}
  </Loader>
}

export const KPIFields = () => {
  const { intent, kpis } = useIntentContext()
  const query = useIntentKPIsQuery({
    ...intent,
    kpis: kpis.map(kpi => _.pick(kpi, ['key', 'deltaSign']))
  }, { skip: kpis.length === 0 })

  const isDetectError = query.isError && !!_.pick(query.error, ['data'])

  const intentKPIs = isDetectError ?
    (_.pick(query.error, ['data']) as { data: IntentKPI }).data
    : query.data

  return <Loader states={[isDetectError? _.omit(query, ['error']) : query]}>
    {getGraphKPIs({ ...intent, ...intentKPIs }, kpis)
      .map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
  </Loader>
}
