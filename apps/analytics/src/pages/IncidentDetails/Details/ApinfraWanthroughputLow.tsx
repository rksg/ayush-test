import { unitOfTime } from 'moment-timezone'
import { useIntl }    from 'react-intl'

import { calculateSeverity, Incident, shortDescription }                  from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol, Card, NotAvailable } from '@acx-ui/components'

import { IncidentAttributes, Attributes }    from '../IncidentAttributes'
import { Insights }                          from '../Insights'
import { NetworkImpact, NetworkImpactProps } from '../NetworkImpact'
import { NetworkImpactChartTypes }           from '../NetworkImpact/config'
import { TimeSeries }                        from '../TimeSeries'
import { TimeSeriesChartTypes }              from '../TimeSeries/config'

import * as UI from './styledComponents'

export const ApinfraWanthroughputLow = (incident: Incident) => {
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

  const networkImpactCharts: NetworkImpactProps['charts'] = [{
    chart: NetworkImpactChartTypes.APModelByAP,
    type: 'apInfra',
    dimension: 'apModels'
  }, {
    chart: NetworkImpactChartTypes.APFwVersionByAP,
    type: 'apInfra',
    dimension: 'apFwVersions'
  }]

  const timeSeriesCharts: TimeSeriesChartTypes[] = [
    TimeSeriesChartTypes.ApWanThroughputImpactChart
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
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '228px' }}>
          <NetworkImpact incident={incident} charts={networkImpactCharts} />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <TimeSeries
            incident={incident}
            charts={timeSeriesCharts}
            minGranularity='PT15M'
            buffer={buffer}
          />
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '250px' }}>
          <Card title={$t({ defaultMessage: 'Impacted APs' })} type='no-border'>
            <NotAvailable/>
          </Card>
        </GridCol>
      </GridRow>
    </>
  )
}
