import { useState } from 'react'

import { GridRow, GridCol }                      from '@acx-ui/components'
import type { ConfigChange as ConfigChangeType } from '@acx-ui/components'

import { Chart } from './Chart'
import { KPIs }  from './KPI'
import { Table } from './Table'

export function ConfigChange () {
  const [selected, setSelected] = useState<ConfigChangeType | null>(null)
  const [dotSelect, setDotSelect] = useState<number | null>(null)
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([])
  const [chartZoom, setChartZoom] = useState<{ start: number, end: number } | undefined>(undefined)
  const [initialZoom, setInitialZoom] = useState<{
    start: number, end: number } | undefined>(undefined)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })

  const onDotClick = (params: ConfigChangeType) => {
    setSelected(params)
    setDotSelect(selected?.id ?? null)
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: Math.ceil((params.id! + 1) / prevPagination.pageSize)
    }))
  }
  const onRowClick = (params: ConfigChangeType) => {
    setSelected(params)
    setChartZoom(initialZoom)
  }

  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
      <Chart
        selected={selected}
        onClick={onDotClick}
        onBrushPositionsChange={setKpiTimeRanges}
        chartZoom={chartZoom}
        setChartZoom={setChartZoom}
        setInitialZoom={setInitialZoom}
      />
    </GridCol>
    <GridCol col={{ span: 8 }}><KPIs kpiTimeRanges={kpiTimeRanges}/></GridCol>
    <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}>
      <Table
        selected={selected}
        onRowClick={onRowClick}
        pagination={pagination}
        setPagination={setPagination}
        dotSelect={dotSelect}
      />
    </GridCol>
  </GridRow>
}
