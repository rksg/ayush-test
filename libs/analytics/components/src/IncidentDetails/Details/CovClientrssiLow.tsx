import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import {
  calculateSeverity,
  Incident,
  shortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol } from '@acx-ui/components'
import { useIsSplitOn, Features }                     from '@acx-ui/feature-toggle'

import { FixedAutoSizer }                    from '../../DescriptionSection/styledComponents'
import { RssDistributionChart }              from '../Charts/RssDistributionChart'
import { IncidentAttributes, Attributes }    from '../IncidentAttributes'
import { Insights }                          from '../Insights'
import { NetworkImpact, NetworkImpactProps } from '../NetworkImpact'
import { NetworkImpactChartTypes }           from '../NetworkImpact/config'
import { TimeSeries }                        from '../TimeSeries'
import { TimeSeriesChartTypes }              from '../TimeSeries/config'

import MuteIncident from './MuteIncident'

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
          ...(useIsSplitOn(Features.NAVBAR_ENHANCEMENT) ? [
            { text: $t({ defaultMessage: 'AI Assurance' }) },
            { text: $t({ defaultMessage: 'AI Analytics' }) }
          ]:[]),
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(incident)}
        extra={[<MuteIncident incident={incident} />]}
      />
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
            minGranularity='PT180S'
            buffer={buffer}
          />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <RssDistributionChart incident={incident} />
        </GridCol>
      </GridRow>
    </>
  )
}
