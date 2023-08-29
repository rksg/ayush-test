import { pick }    from 'lodash'
import { useIntl } from 'react-intl'

import { KpiThresholdType, useApCountForNodeQuery }       from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card, Loader, ProgressBarV2 }                    from '@acx-ui/components'
import { formatter }                                      from '@acx-ui/formatter'

import { useKpiThresholdsQuery } from '../Health/Kpi'
import { usePillQuery }          from '../Health/Kpi/Pill'

import * as UI from './styledComponents'

type SLABarChartProps = {
  kpi: string,
  threshold: number
  filters: AnalyticsFilter
}
const SLAComponent = ({ kpi, threshold, filters } : SLABarChartProps) => {
  const { $t } = useIntl()
  const { text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])

  const apCountResult = useApCountForNodeQuery(filters)
  const apCount = apCountResult.data?.network.node.apCount

  const { queryResults, percent } = usePillQuery({
    kpi, filters, timeWindow: pick(filters, ['startDate', 'endDate' ]), threshold, apCount
  })

  return <Loader states={[apCountResult, queryResults]}>
    <UI.Wrapper>
      {$t(text)}
      <UI.Text>{$t(
        { defaultMessage: '{percent} meets goal' },
        { percent: formatter('percentFormatRound')(percent) }
      )}</UI.Text>
      <ProgressBarV2 percent={percent * 100}/>
    </UI.Wrapper>
  </Loader>
}

export const SLA = (props: { filters: AnalyticsFilter }) => {
  const { $t } = useIntl()

  const kpis= [ 'connectionSuccess', 'timeToConnect', 'clientThroughput']
  const { filters } = useAnalyticsFilter()
  const { thresholds, kpiThresholdsQueryResults } = useKpiThresholdsQuery({ filters })

  return <Loader states={[kpiThresholdsQueryResults]}>
    <Card title={$t({ defaultMessage: 'SLA' })} >
      {kpis.map((kpi, index)=>
        <SLAComponent
          key={`SLA${index}`}
          kpi={kpi}
          threshold={thresholds[kpi as keyof KpiThresholdType]}
          filters={props.filters}
        />)}
    </Card>
  </Loader>
}
