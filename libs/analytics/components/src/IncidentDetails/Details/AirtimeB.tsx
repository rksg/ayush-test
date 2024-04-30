import moment, { unitOfTime } from 'moment-timezone'
import { useIntl }            from 'react-intl'

import { calculateSeverity, Incident, shortDescription } from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol }    from '@acx-ui/components'
import { hasPermission }                                 from '@acx-ui/user'

import { FixedAutoSizer }                                   from '../../DescriptionSection/styledComponents'
import { IncidentAttributes, Attributes }                   from '../IncidentAttributes'
import { Insights }                                         from '../Insights'
import { extraValues }                                      from '../Insights/extraValues/config'
import { NetworkImpact, NetworkImpactProps }                from '../NetworkImpact'
import { NetworkImpactChartTypes, NetworkImpactQueryTypes } from '../NetworkImpact/config'
import { TimeSeries }                                       from '../TimeSeries'
import { TimeSeriesChartTypes }                             from '../TimeSeries/config'

import { MuteIncident } from './MuteIncident'

export const AirtimeB = (incident: Incident) => {
  const { $t } = useIntl()
  const attributeList = [
    Attributes.ClientImpactCount,
    Attributes.ApImpactCount,
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    ...((moment(incident.startTime).isSame(incident.impactedStart))
      ? [Attributes.EventEndTime] : [Attributes.DataStartTime, Attributes.DataEndTime])
  ]
  const rogueEnabled = incident.metadata.rootCauseChecks?.checks
    .some(check => check.isRogueDetectionEnabled)

  const networkImpactCharts: NetworkImpactProps['charts'] = [
    {
      chart: NetworkImpactChartTypes.AirtimeBusy,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtimeMetric',
      dimension: 'airtimeBusy'
    },
    {
      chart: NetworkImpactChartTypes.RogueAPByChannel,
      query: NetworkImpactQueryTypes.TopN,
      type: 'rogueAp',
      dimension: 'rogueChannel',
      disabled: !rogueEnabled
    },
    {
      chart: NetworkImpactChartTypes.RxPhyErrByAP,
      query: NetworkImpactQueryTypes.TopN,
      type: 'apAirtime',
      dimension: 'phyError'
    },
    {
      chart: NetworkImpactChartTypes.APModelByAP,
      query: NetworkImpactQueryTypes.TopN,
      type: 'apInfra',
      dimension: 'apModels'
    }
  ]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.AirtimeUtilizationChart
  ]

  const insightExtraValues = {
    rogueapdrawer: extraValues.RogueAPsDrawerLink(incident)
  }

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
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'AI Analytics' }) },
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(incident)}
        extra={hasPermission() ? [<MuteIncident incident={incident} />] : []}
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
          <Insights incident={incident} extraValues={insightExtraValues} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '228px' }}>
          <NetworkImpact incident={incident} charts={networkImpactCharts} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <TimeSeries
            incident={incident}
            charts={timeSeriesCharts}
            minGranularity='PT15M'
            buffer={buffer} />
        </GridCol>
      </GridRow>
    </>
  )
}
