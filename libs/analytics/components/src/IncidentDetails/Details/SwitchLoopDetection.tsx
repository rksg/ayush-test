import type { Incident }          from '@acx-ui/analytics/utils'
import { GridRow, GridCol }       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { ImpactedSwitchesDonut }          from '../Charts/ImpactedSwitchesDonut'
import { ImpactedVlanTable  }             from '../Charts/ImpactedSwitchLoopDetection'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'

import { IncidentHeader } from './IncidentHeader'

export const SwitchLoopDetection = (incident: Incident) => {
  // TODO: remove the hardcoded id when Data is available
  const incidentCopy = { ...incident, id: 'dc82d0ce-129a-4e3c-8323-1a405ec28152' }


  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  const isEnabled = [
    useIsSplitOn(Features.INCIDENTS_SWITCH_LOOP_DETECTION_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INCIDENTS_SWITCH_LOOP_DETECTION_TOGGLE)
  ].some(Boolean)

  return isEnabled ? <>
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
      <GridCol col={{ offset: 4, span: 5 }} style={{ minHeight: '249px' }}>
        <ImpactedSwitchesDonut incident={incidentCopy}/>
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '249px' }}>
        <ImpactedVlanTable incident={incidentCopy} />
      </GridCol>
    </GridRow>
  </> : null
}
