import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { calculateSeverity, Incident, shortDescription } from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol }    from '@acx-ui/components'
import { useIsSplitOn, Features }                        from '@acx-ui/feature-toggle'

import { IncidentAttributes, Attributes }    from '../IncidentAttributes'
import { Insights }                          from '../Insights'
import { TimeSeries }                        from '../TimeSeries'
import { TimeSeriesChartTypes }              from '../TimeSeries/config'

import MuteIncident from './MuteIncident'
import * as UI      from './styledComponents'

export const ChannelDist = (incident: Incident) => {
  const { $t } = useIntl()
  const attributeList = [
    Attributes.ApImpactCount,
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]


  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.ChannelChangeCount
  ]

  const buffer = {
    front: { value: 6, unit: 'hours' as unitOfTime.Base },
    back: { value: 6, unit: 'hours' as unitOfTime.Base }
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
          <UI.FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IncidentAttributes incident={incident} visibleFields={attributeList} />
              CONFIGURATION SECTION
            </div>)}
          </UI.FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Insights incident={incident} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '228px' }}>
        AP DISTRIBUTION BY CHANNEL
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '180px' }}>
        ROGUE DISTRIBUTION BY CHANNEL
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '180px' }}>
        DFS EVENTS BY CHANNEL (for 5G INDOOR/OUTDOOR)
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <TimeSeries
            incident={incident}
            charts={timeSeriesCharts}
            minGranularity='PT15M'
            buffer={buffer}
          />
        </GridCol>
        
      </GridRow>
    </>
  )
}
