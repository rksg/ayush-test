import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { ImpactedSwitchVLANsDetails }     from '../Charts/ImpactedSwitchVLANDetails'
import { ImpactedSwitchVLANsTable }       from '../Charts/ImpactedSwitchVLANsTable'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'

import { IncidentHeader } from './IncidentHeader'

export const SwitchVlanMismatch = (incident: Incident) => {
  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime,
    Attributes.Visibility
  ]

  return <>
    <IncidentHeader incident={incident} />
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '129px' }}>
        <ImpactedSwitchVLANsDetails incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <ImpactedSwitchVLANsTable incident={incident} />
      </GridCol>
    </GridRow>
  </>
}
