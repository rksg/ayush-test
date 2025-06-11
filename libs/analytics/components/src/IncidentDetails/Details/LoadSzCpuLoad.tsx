import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'

import { IncidentHeader } from './IncidentHeader'

export const LoadSzCpuLoad = (incident: Incident) => {
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
    </GridRow>
  </>
}
