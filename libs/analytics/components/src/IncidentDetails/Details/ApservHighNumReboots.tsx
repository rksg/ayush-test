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

export const ApservHighNumReboots = (incident: Incident) => {
  const attributeList = [
    Attributes.ClientImpactCount,
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
    type: 'apReboot',
    dimension: 'apModel'
  }, {
    chart: NetworkImpactChartTypes.APFwVersionByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apReboot',
    dimension: 'apFwVersion'
  }, {
    chart: NetworkImpactChartTypes.RebootReasonByAP,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apReboot',
    dimension: 'reason'
  }, {
    chart: NetworkImpactChartTypes.RebootReasonsByEvent,
    query: NetworkImpactQueryTypes.TopN,
    type: 'apRebootEvent',
    dimension: 'reason'
  }]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.ApRebootBySystemChart,
    TimeSeriesChartTypes.ConnectedClientsChart,
    TimeSeriesChartTypes.RebootedApsCountChart
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
