import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { calculateSeverity, Incident, shortDescription } from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol }    from '@acx-ui/components'

import { ChannelConfig }                  from '../ChannelConfig'
import { ChannelDistributionHeatMap }     from '../Charts/ChannelDistributionHeatmap'
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
    front: { value: 0, unit: 'hours' as unitOfTime.Base },
    back: { value: 0, unit: 'hours' as unitOfTime.Base }
  }

  const heatMapChartsConfig = [
    {
      key: 'apDistribution',
      value: $t({ defaultMessage: 'AP DISTRIBUTION BY CHANNEL' }),
      channel: 'channel',
      count: 'apCount',
      countText: $t({ defaultMessage: 'Ap Count' })
    },
    {
      key: 'rogueDistribution',
      value: $t({ defaultMessage: 'ROGUE DISTRIBUTION BY CHANNEL' }),
      channel: 'rogueChannel',
      count: 'rogueApCount',
      countText: $t({ defaultMessage: 'Rogue AP Count' })
    },
    ...(incident.code.includes('24g')
      ? []
      : [
        {
          key: 'dfsEvents',
          value: $t({ defaultMessage: 'DFS EVENTS BY CHANNEL' }),
          channel: 'channel',
          count: 'eventCount',
          countText: $t({ defaultMessage: 'DFS Events' })
        }
      ])
  ]
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={
          <SeverityPill severity={calculateSeverity(incident.severity)!} />
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'AI Analytics' }) },
          {
            text: $t({ defaultMessage: 'Incidents' }),
            link: '/analytics/incidents'
          }
        ]}
        subTitle={shortDescription(incident)}
        extra={[<MuteIncident incident={incident} />]}
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
          <ChannelConfig incident={incident}/>
        </GridCol>
        {heatMapChartsConfig.map((heatMap, index) => (
          <GridCol key={index} col={{ offset: 4, span: 20 }}>
            {
              <ChannelDistributionHeatMap
                heatMapConfig={heatMap}
                incident={incident}
                buffer={buffer}
                minGranularity='PT3M'
              />
            }
          </GridCol>
        ))}
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <TimeSeries
            incident={incident}
            charts={timeSeriesCharts}
            minGranularity='PT3M'
            buffer={buffer}
          />
        </GridCol>
      </GridRow>
    </>
  )
}
