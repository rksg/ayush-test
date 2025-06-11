import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                 from '../../DescriptionSection/styledComponents'
import { PoePdTable }                     from '../Charts/PoePdTable'
import { IncidentAttributes, Attributes } from '../IncidentAttributes'
import { Insights }                       from '../Insights'

import { IncidentHeader } from './IncidentHeader'

export const SwitchPoePd = (incident: Incident) => {
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
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '180px' }}>
        <PoePdTable incident={incident}/>
      </GridCol>
    </GridRow>
  </>
}
