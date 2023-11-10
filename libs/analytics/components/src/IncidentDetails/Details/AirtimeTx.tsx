
import moment         from 'moment'
import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { calculateSeverity, Incident, shortDescription } from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol }    from '@acx-ui/components'

import { FixedAutoSizer }                    from '../../DescriptionSection/styledComponents'
import { IncidentAttributes, Attributes }    from '../IncidentAttributes'
import { Insights }                          from '../Insights'
import { NetworkImpact, NetworkImpactProps } from '../NetworkImpact'
import { TimeSeries }                        from '../TimeSeries'
import { TimeSeriesChartTypes }              from '../TimeSeries/config'

import MuteIncident from './MuteIncident'

export const AirtimeTx = (incident: Incident) => {
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
    Attributes.EventEndTime
  ]

  const networkImpactCharts: NetworkImpactProps['charts'] = []

  const timeSeriesCharts: TimeSeriesChartTypes[] = []

  const buffer = {
    front: { value: 0, unit: 'hours' as unitOfTime.Base },
    back: { value: 0, unit: 'hours' as unitOfTime.Base }
  }

  const incidentWithQueryTime = {
    ...incident,
    startTime: moment(incident.endTime).clone().subtract(24, 'hours').format()
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
        extra={[<MuteIncident incident={incident} />]}
      />
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IncidentAttributes incident={incidentWithQueryTime} visibleFields={attributeList} />
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Insights incident={incident} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '228px' }}>
          {/* TODO: remove condtional check after adding timeSeriesCharts */}
          { networkImpactCharts.length > 0
            ? <NetworkImpact incident={incidentWithQueryTime} charts={networkImpactCharts} />
            : null}
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          {/* TODO: remove condtional check after adding timeSeriesCharts */}
          { timeSeriesCharts.length > 0
            ? <TimeSeries
              incident={incidentWithQueryTime}
              charts={timeSeriesCharts}
              minGranularity='PT15M'
              buffer={buffer} />
            : null}
        </GridCol>
      </GridRow>
    </>
  )
}
