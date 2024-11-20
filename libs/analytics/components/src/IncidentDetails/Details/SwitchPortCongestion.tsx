import { unitOfTime } from 'moment-timezone'

import { calculateGranularity, type Incident } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                    from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'
import { TimeSeries }                     from '../TimeSeries'
import { TimeSeriesChartTypes }           from '../TimeSeries/config'

import { IncidentHeader } from './IncidentHeader'

export const SwitchPortCongestion = (incident: Incident) => {
  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  const isEnabled = [
    useIsSplitOn(Features.INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE)
  ].some(Boolean)

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.SwitchImpactedPortsCount
  ]

  const buffer = {
    front: { value: 0, unit: 'seconds' as unitOfTime.Base },
    back: { value: 0, unit: 'seconds' as unitOfTime.Base }
  }

  return isEnabled ? <>
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          minGranularity={calculateGranularity(incident.startTime, incident.endTime, 'PT1H')}
          buffer={buffer}
        />
      </GridCol>
    </GridRow>
  </> : null
}
