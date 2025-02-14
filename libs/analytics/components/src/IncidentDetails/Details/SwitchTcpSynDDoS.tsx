import { unitOfTime } from 'moment-timezone'

import { calculateGranularity, type Incident } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                    from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'

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

  const start = incident.impactedStart || incident.startTime
  const end = incident.impactedEnd || incident.endTime

  const granularity = calculateGranularity(start, end, 'PT15M')

  const binMinsMap: Record<string, number> = {
    PT15M: 15,
    PT1H: 60,
    PT1D: 1440
  }

  const noOfBinsForBufferMap: Record<string, number> = {
    PT15M: 24,
    PT1H: 6,
    PT1D: 3
  }

  // check binMinsMap and noOfBinsForBufferMap
  const binMins = binMinsMap[granularity] ?? 60 // 60 minutes as default when rollup happens
  const noOfBinsForBuffer = noOfBinsForBufferMap[granularity] ?? 6 // 6 bins as default for 60 minutes granularity when rollup happens

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
          minGranularity={'PT15M'}
          buffer={buffer}
        />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <ImpactedSwitchDDoSTable incident={incident} />
      </GridCol>
    </GridRow>
  </> : null
}
