import { useState } from 'react'

import { GridRow, GridCol } from '@acx-ui/components'

import { MemoChart as Chart } from './Chart'
import { KPIs }               from './KPI/KPIs'

export function ConfigChange () {
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([])

  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
      <Chart onBrushPositionsChange={setKpiTimeRanges}/>
    </GridCol>
    <GridCol col={{ span: 8 }}><KPIs kpiTimeRanges={kpiTimeRanges}/></GridCol>
    <GridCol col={{ span: 16 }}><div>table</div></GridCol>
  </GridRow>
}
