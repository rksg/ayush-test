import { GridRow, GridCol } from '@acx-ui/components'

import { Chart }             from './Chart'
import { ConfigChangeTable } from './ConfigChangeTable'

export function ConfigChange () {
  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}> <Chart /></GridCol>
    <GridCol col={{ span: 8 }}>
      <div>kpi</div>
    </GridCol>
    <GridCol col={{ span: 16 }}>
      <ConfigChangeTable />
    </GridCol>
  </GridRow>
}
