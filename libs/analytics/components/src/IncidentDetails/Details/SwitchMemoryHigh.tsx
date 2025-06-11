import { unitOfTime } from 'moment-timezone'

import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { SwitchDetail }         from '../Charts/SwitchDetail'
import { IncidentAttributes }   from '../IncidentAttributes'
import { Insights }             from '../Insights'
import { TimeSeries }           from '../TimeSeries'
import { TimeSeriesChartTypes } from '../TimeSeries/config'

import { commonAttributes } from './constants'
import { IncidentHeader }   from './IncidentHeader'

const attributeList = commonAttributes()
const timeSeriesCharts: TimeSeriesChartTypes[] = [
  TimeSeriesChartTypes.SwitchMemoryUtilizationChart
]
const buffer = {
  front: { value: 10, unit: 'days' as unitOfTime.Base },
  back: { value: 1, unit: 'second' as unitOfTime.Base }
}

export const SwitchMemoryHigh = (incident: Incident) => {
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '203px' }}>
        <SwitchDetail incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
        <TimeSeries
          incident={incident}
          charts={timeSeriesCharts}
          minGranularity='PT1H'
          buffer={buffer}
        />
      </GridCol>
    </GridRow>
  </>
}
