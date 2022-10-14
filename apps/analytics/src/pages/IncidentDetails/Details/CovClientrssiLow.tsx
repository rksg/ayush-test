import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import {
  calculateSeverity,
  Incident,
  shortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol } from '@acx-ui/components'

import { IncidentAttributes, Attributes }    from '../IncidentAttributes'
import { Insights }                          from '../Insights'
import { NetworkImpact, NetworkImpactProps } from '../NetworkImpact'
import { NetworkImpactChartTypes }           from '../NetworkImpact/config'
import { TimeSeries }                        from '../TimeSeries'
import { TimeSeriesChartTypes }              from '../TimeSeries/config'

import * as UI from './styledComponents'

export const CovClientrssiLow = (incident: Incident) => {
  const { $t } = useIntl()
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
    type: 'client',
    dimension: 'ssids'
  }, {
    chart: NetworkImpactChartTypes.OS,
    type: 'client',
    dimension: 'osType'
  }, {
    chart: NetworkImpactChartTypes.APModel,
    type: 'client',
    dimension: 'apModels'
  }, {
    chart: NetworkImpactChartTypes.APVersion,
    type: 'client',
    dimension: 'apFwVersions'
  }, {
    chart: NetworkImpactChartTypes.Radio,
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

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={<SeverityPill severity={calculateSeverity(incident.severity)!} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(incident)}
      />
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <UI.FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IncidentAttributes incident={incident} visibleFields={attributeList} />
            </div>)}
          </UI.FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Insights incident={incident} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }}>
          <NetworkImpact incident={incident} charts={networkImpactCharts}/>
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }}>
          <TimeSeries
            incident={incident}
            charts={timeSeriesCharts}
            minGranularity='PT180S'
            buffer={buffer}
          />
        </GridCol>
      </GridRow>
    </>
  )
}
