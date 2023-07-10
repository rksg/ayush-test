import { GridRow, GridCol } from '@acx-ui/components'

import { Chart } from './Chart'
import { Table } from './Table'

export function ConfigChange () {
  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}> <Chart /></GridCol>
    <GridCol col={{ span: 8 }} style={{ minHeight: '180px' }}><div>kpi</div></GridCol>
    <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}><Table /></GridCol>
  </GridRow>
}
