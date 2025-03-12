import { unitOfTime } from 'moment-timezone'

import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                                   from '../../DescriptionSection/styledComponents'
import { IncidentAttributes, Attributes }                   from '../IncidentAttributes'
import { Insights }                                         from '../Insights'
import { NetworkImpact, NetworkImpactProps }                from '../NetworkImpact'
import { NetworkImpactChartTypes, NetworkImpactQueryTypes } from '../NetworkImpact/config'
import { TimeSeries }                                       from '../TimeSeries'
import { TimeSeriesChartTypes }                             from '../TimeSeries/config'

import { IncidentHeader } from './IncidentHeader'

export const ApservDowntimeHigh = (incident: Incident) => {
  const attributeList = [
    Attributes.ApImpactCount,
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  const networkImpactCharts: NetworkImpactProps['charts'] = [{
    chart: NetworkImpactChartTypes.APModelByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apDowntime',
    dimension: 'apModel'
  }, {
    chart: NetworkImpactChartTypes.APFwVersionByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apDowntime',
    dimension: 'apFwVersion'
  }, {
    chart: NetworkImpactChartTypes.EventTypeByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apDowntime',
    dimension: 'eventType'
  }, {
    chart: NetworkImpactChartTypes.ReasonByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apDowntime',
    dimension: 'reason'
  }]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.ApDisconnectionCountChart,
    TimeSeriesChartTypes.DowntimeEventTypeDistributionChart
  ]
  const buffer = {
    front: { value: 6, unit: 'hours' as unitOfTime.Base },
    back: { value: 6, unit: 'hours' as unitOfTime.Base }
  }
  return <>
    <IncidentHeader incident={incident} />
    <GridRow>
      <GridCol col={{ span: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <IncidentAttributes incident={incident} visibleFields={attributeList} />
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <GridCol col={{ span: 20 }}>
        <Insights incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '228px' }}>
        <NetworkImpact incident={incident} charts={networkImpactCharts} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          buffer={buffer}
        />
      </GridCol>
    </GridRow>
  </>
}
