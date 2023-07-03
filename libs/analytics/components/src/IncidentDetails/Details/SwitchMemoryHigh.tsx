import { useIntl } from 'react-intl'

import {
  calculateSeverity,
  Incident,
  shortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, GridRow, GridCol } from '@acx-ui/components'
import { useIsSplitOn, Features }                     from '@acx-ui/feature-toggle'

import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'

import MuteIncident from './MuteIncident'
import * as UI      from './styledComponents'

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
            </div>)}
          </UI.FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Insights incident={incident} />
        </GridCol>
      </GridRow>
    </>
  )
}
