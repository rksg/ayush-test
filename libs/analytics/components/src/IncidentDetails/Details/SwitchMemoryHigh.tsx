import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import {
  calculateSeverity,
  Incident,
  shortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol } from '@acx-ui/components'
import { hasPermission }                              from '@acx-ui/user'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { SwitchDetail }                   from '../Charts/SwitchDetail'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'
import { TimeSeries }                     from '../TimeSeries'
import { TimeSeriesChartTypes }           from '../TimeSeries/config'

import { MuteIncident } from './MuteIncident'

export const SwitchMemoryHigh = (incident: Incident) => {
  const { $t } = useIntl()
  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.SwitchMemoryUtilizationChart
  ]

  const buffer = {
    front: { value: 10, unit: 'days' as unitOfTime.Base },
    back: { value: 1, unit: 'second' as unitOfTime.Base }
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
  )
}
