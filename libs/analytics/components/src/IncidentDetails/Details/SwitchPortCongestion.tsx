import { unitOfTime } from 'moment-timezone'

import { granularityToHours, type Incident } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                  from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'

import { FixedAutoSizer }             from '../../DescriptionSection/styledComponents'
import { SwitchDetail,
  ImpactedSwitchPortConjestionTable }     from '../Charts/ImpactedSwitchPortCongestion/index'
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

  const granularities: typeof granularityToHours = [
    { granularity: 'PT30M', hours: 24 * 3 }, // 30 mins for 3 days and above
    { granularity: 'PT15M', hours: 24 * 1 }, // 15 mins for 1 day and above
    { granularity: 'PT5M', hours: 0 } // 5 mins for less than 1 day
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '203px' }}>
        <SwitchDetail incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          minGranularity={'PT5M'}
          granularities={granularities}
          buffer={buffer}
        />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <ImpactedSwitchPortConjestionTable incident={incident} />
      </GridCol>
    </GridRow>
  </> : null
}
