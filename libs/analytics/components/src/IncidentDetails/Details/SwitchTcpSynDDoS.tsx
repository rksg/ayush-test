import { unitOfTime } from 'moment-timezone'

import { calculateGranularity,
  granularityToHours, type Incident } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { ImpactedSwitchDDoSTable }        from '../Charts/ImpactedSwitchDDoS'
import { ImpactedSwitchesDonut }          from '../Charts/ImpactedSwitchesDonut'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'
import { TimeSeries }                     from '../TimeSeries'
import { TimeSeriesChartTypes }           from '../TimeSeries/config'

import { IncidentHeader } from './IncidentHeader'

export const SwitchTcpSynDDoS = (incident: Incident) => {
  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.SwitchImpactedPortsCount
  ]

  const granularities: typeof granularityToHours = [
    { granularity: 'PT30M', hours: 24 * 3 }, // 30 mins for 3 days and above
    { granularity: 'PT15M', hours: 24 * 1 }, // 15 mins for 1 day and above
    { granularity: 'PT3M', hours: 0 } // 3 mins for less than 1 day
  ]

  const start = incident.impactedStart || incident.startTime
  const end = incident.impactedEnd || incident.endTime

  const granularity = calculateGranularity(start, end, 'PT3M', granularities)

  const binMins = granularity === 'PT15M' ? 15 : granularity === 'PT30M' ? 30 : 3
  const noOfBinsForBuffer = granularity === 'PT15M' ? 5 : granularity === 'PT30M' ? 8 : 3

  const buffer = {
    front: { value: binMins * noOfBinsForBuffer, unit: 'minutes' as unitOfTime.Base },
    back: { value: binMins * noOfBinsForBuffer, unit: 'minutes' as unitOfTime.Base }
  }

  const isEnabled = [
    useIsSplitOn(Features.INCIDENTS_SWITCH_DDOS_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_DDOS_TOGGLE)
  ].some(Boolean)

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
      <GridCol col={{ offset: 4, span: 5 }} style={{ minHeight: '129px' }}>
        <ImpactedSwitchesDonut incident={incident} />
      </GridCol>
      <GridCol col={{ span: 15 }} style={{ minHeight: '129px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          minGranularity={'PT180S'}
          granularities={granularities}
          buffer={buffer}
        />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <ImpactedSwitchDDoSTable incident={incident} />
      </GridCol>
    </GridRow>
  </> : null
}
