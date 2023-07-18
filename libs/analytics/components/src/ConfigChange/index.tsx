import { useState } from 'react'

import { GridRow, GridCol }                      from '@acx-ui/components'
import type { ConfigChange as ConfigChangeType } from '@acx-ui/components'

import { Chart } from './Chart'
import { KPIs }  from './KPI'
import { Table } from './Table'


export function ConfigChange () {
  const [selected, setSelected] = useState<ConfigChangeType | null>(null)
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([])

  const handleClick = (params: ConfigChangeType) => {
    setSelected(params)
  }

  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
      <Chart selected={selected} onClick={handleClick} onBrushPositionsChange={setKpiTimeRanges}/>
    </GridCol>
    <GridCol col={{ span: 8 }}><KPIs kpiTimeRanges={kpiTimeRanges}/></GridCol>
    <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}><Table selectedRow={selected} onRowClick={handleClick}/></GridCol>
  </GridRow>
}
