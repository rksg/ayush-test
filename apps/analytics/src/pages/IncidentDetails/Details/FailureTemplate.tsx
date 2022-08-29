import { useIntl } from 'react-intl'

import {
  calculateSeverity,
  Incident,
  useShortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol } from '@acx-ui/components'

import { IncidentAttributes } from '../IncidentAttributes'
import { TimeSeries }         from '../TimeSeries'
import { NetworkImpact }      from '../NetworkImpact'

import * as UI from './styledComponents'

export const IncidentDetailsTemplate = (incident: Incident) => {
  const networkImpactCharts = [ 'WLAN', 'radio', 'reason', 'clientManufacturer']

  const { $t } = useIntl()
  const timeSeriesCharts = [
    'incidentCharts',
    'relatedIncidents',
    'clientCountCharts',
    'attemptAndFailureCharts'
  ]
  const attributeList = [
    'clientImpactCount',
    'incidentCategory',
    'incidentSubCategory',
    'type',
    'scope',
    'duration',
    'eventStartTime',
    'eventEndTime'
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={<SeverityPill severity={calculateSeverity(incident.severity)!} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={useShortDescription(incident)}
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
          <div>Insights</div>
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }}>
          <NetworkImpact incident={incident} charts={networkImpactCharts}/>
        </GridCol>
        <GridCol col={{ offset: 4, span: 20 }}>
          <TimeSeries incident={incident} charts={timeSeriesCharts}/>
        </GridCol>
      </GridRow>
    </>
  )
}

export default IncidentDetailsTemplate
