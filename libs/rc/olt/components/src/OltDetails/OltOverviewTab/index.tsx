import { useContext } from 'react'

import { GridCol, GridRow } from '@acx-ui/components'
import { OltMockdata }      from '@acx-ui/olt/utils'

import { OltFrontPanel }     from '../../OltFrontPanel'
import { OltDetailsContext } from '../OltDetailsContext'

const { networkCardSlots, lineCardSlots } = OltMockdata

export const OltOverviewTab = () => {
  const { oltDetailsContextData } = useContext(OltDetailsContext)

  const data = [
    ...networkCardSlots,
    ...networkCardSlots,
    ...lineCardSlots
  ]

  return (<>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ marginTop: '24px' }}>
        <OltFrontPanel
          title={oltDetailsContextData.model}
          data={data}
        />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '380px' }}>
      </GridCol>
    </GridRow>
  </>)
}
