import moment from 'moment-timezone'

import { type Incident }          from '@acx-ui/analytics/utils'
import { GridRow, GridCol }       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { FixedAutoSizer }             from '../../DescriptionSection/styledComponents'
import { SwitchDetail,
  ImpactedSwitchPortConjestionTable }     from '../Charts/ImpactedSwitchPortCongestion/index'
import { IncidentAttributes }   from '../IncidentAttributes'
import { Insights }             from '../Insights'
import { TimeSeries }           from '../TimeSeries'
import { TimeSeriesChartTypes } from '../TimeSeries/config'

import { commonAttributes }    from './constants'
import { IncidentHeader }      from './IncidentHeader'
import { getTimeseriesBuffer } from './portCountTimeseriesHelper'

const attributeList = commonAttributes()
const timeSeriesCharts: TimeSeriesChartTypes[] = [
  TimeSeriesChartTypes.SwitchImpactedPortsCount
]

export const SwitchPortCongestion = (incident: Incident) => {
  const isEnabled = [
    useIsSplitOn(Features.INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_PORT_CONGESTION_TOGGLE)
  ].some(Boolean)

  const start = incident.impactedStart || incident.startTime
  const end = incident.impactedEnd || incident.endTime
  const buffer = getTimeseriesBuffer(start, end)

  // Calculate granularity based on incident duration
  const duration = moment.duration(moment(end).diff(moment(start)))
  const durationHours = duration.asHours()

  // For incidents less than 24 hours, use PT5M directly
  // For longer incidents, let the default granularity calculation handle it
  const granularityOverride = durationHours < 24 ? 'PT5M' : undefined

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
          buffer={buffer}
          minGranularity={granularityOverride}
        />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <ImpactedSwitchPortConjestionTable incident={incident} />
      </GridCol>
    </GridRow>
  </> : null
}
