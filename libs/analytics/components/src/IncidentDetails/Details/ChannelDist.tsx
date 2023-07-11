import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { calculateSeverity, Incident, shortDescription } from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol }    from '@acx-ui/components'

import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'
import { TimeSeries }                     from '../TimeSeries'
import { TimeSeriesChartTypes }           from '../TimeSeries/config'

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

  // TODO
  const heatMapCharts = [
    'AP DISTRIBUTION BY CHANNEL',
    'ROGUE DISTRIBUTION BY CHANNEL',
    ...(incident.code === 'p-channeldist-suboptimal-plan-24g') ? [] : ['DFS EVENTS BY CHANNEL']
  ]
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
          <UI.FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IncidentAttributes incident={incident} visibleFields={attributeList} />
              CONFIGURATION SECTION TBD
            </div>)}
          </UI.FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Insights incident={incident} />
        </GridCol>
        {heatMapCharts.map((heatMap, index) =>
          <GridCol key={index} col={{ offset: 4, span: 20 }}>
            {heatMap}
          </GridCol>
        )}
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
