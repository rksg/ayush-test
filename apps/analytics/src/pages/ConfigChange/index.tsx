import { GridRow, GridCol } from '@acx-ui/components'

import { ConfigChangeChart } from './ConfigChangeChart'

export function ConfigChange () {
  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
      <ConfigChangeChart />
    </GridCol>
    <GridCol col={{ span: 8 }}>
      <div>kpi</div>
    </GridCol>
    <GridCol col={{ span: 16 }}>
      <div>table</div>
    </GridCol>
  </GridRow>
}
