import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }     from '../../DescriptionSection/styledComponents'
import { IncidentAttributes } from '../IncidentAttributes'
import { Insights }           from '../Insights'

import { commonAttributes } from './constants'
import { IncidentHeader }   from './IncidentHeader'

const attributeList = commonAttributes()

export const NetSzNetLatency = (incident: Incident) => {
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
