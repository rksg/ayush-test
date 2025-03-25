import { unitOfTime } from 'moment-timezone'

import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                                   from '../../DescriptionSection/styledComponents'
import { RssDistributionChart }                             from '../Charts/RssDistributionChart'
import { IncidentAttributes, Attributes }                   from '../IncidentAttributes'
import { Insights }                                         from '../Insights'
import { NetworkImpact, NetworkImpactProps }                from '../NetworkImpact'
import { NetworkImpactChartTypes, NetworkImpactQueryTypes } from '../NetworkImpact/config'
import { TimeSeries }                                       from '../TimeSeries'
import { TimeSeriesChartTypes }                             from '../TimeSeries/config'

import { IncidentHeader } from './IncidentHeader'

export const CovClientrssiLow = (incident: Incident) => {
  const attributeList = [
    Attributes.ClientImpactCount,
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]
  const networkImpactCharts: NetworkImpactProps['charts'] = [{
    chart: NetworkImpactChartTypes.WLAN,
    query: NetworkImpactQueryTypes.TopN,
    type: 'client',
    dimension: 'ssids'
  }, {
    chart: NetworkImpactChartTypes.OS,
    query: NetworkImpactQueryTypes.TopN,
    type: 'client',
    dimension: 'osType'
  }, {
    chart: NetworkImpactChartTypes.APModel,
    query: NetworkImpactQueryTypes.TopN,
    type: 'client',
    dimension: 'apModels'
  }, {
    chart: NetworkImpactChartTypes.APVersion,
    query: NetworkImpactQueryTypes.TopN,
    type: 'client',
    dimension: 'apFwVersions'
  }, {
    chart: NetworkImpactChartTypes.Radio,
    query: NetworkImpactQueryTypes.TopN,
    type: 'client',
    dimension: 'radios'
  }]
  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.RssQualityByClientsChart
  ]
  const buffer = {
    front: { value: 0, unit: 'hours' as unitOfTime.Base },
    back: { value: 0, unit: 'hours' as unitOfTime.Base }
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
        <RssDistributionChart incident={incident} />
      </GridCol>
    </GridRow>
  </>
}
