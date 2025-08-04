import { useContext } from 'react'

import { GridCol, GridRow } from '@acx-ui/components'

import { OltDetailsContext } from '../index'

import { OltFrontPanel } from './OltFrontPanel'

export const OltOverviewTab = () => {
  const { oltDetailsContextData } = useContext(OltDetailsContext)

  return (<>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ marginTop: '24px' }}>
        <OltFrontPanel oltDetails={oltDetailsContextData} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '380px' }}>
      </GridCol>
    </GridRow>
  </>)
}
