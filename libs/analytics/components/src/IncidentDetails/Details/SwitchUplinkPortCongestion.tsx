
import { type Incident }          from '@acx-ui/analytics/utils'
import { GridRow, GridCol }       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { FixedAutoSizer }            from '../../DescriptionSection/styledComponents'
import { ImpactedSwitchUplinkTable } from '../Charts/ImpactedSwitchUplinkTable'
import { ImpactedUplinkPortDetails } from '../Charts/ImpactedUplinkPortDetails'
import { IncidentAttributes }        from '../IncidentAttributes'
import { Insights }                  from '../Insights'
import { TimeSeries }                from '../TimeSeries'
import { TimeSeriesChartTypes }      from '../TimeSeries/config'

import { commonAttributes }    from './constants'
import { IncidentHeader }      from './IncidentHeader'
import { getTimeseriesBuffer } from './portCountTimeseriesHelper'

const attributeList = commonAttributes()
const timeSeriesCharts: TimeSeriesChartTypes[] = [
  TimeSeriesChartTypes.SwitchUplinkPortCongestionChart
]

export const SwitchUplinkPortCongestion = (incident: Incident) => {
  const start = incident.impactedStart || incident.startTime
  const end = incident.impactedEnd || incident.endTime
  const buffer = getTimeseriesBuffer(start, end)

  const isEnabled = [
    useIsSplitOn(Features.INCIDENTS_SWITCH_UPLINK_PORT_CONGESTION_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_UPLINK_PORT_CONGESTION_TOGGLE)
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <ImpactedUplinkPortDetails incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          buffer={buffer}
        />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <ImpactedSwitchUplinkTable incident={incident} />
      </GridCol>
    </GridRow>
  </> : null
}
