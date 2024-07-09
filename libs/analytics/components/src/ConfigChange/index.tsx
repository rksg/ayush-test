import { useEffect, useState } from 'react'

import {
  ConfigChange as ConfigChangeType,
  useDateRange,
  GridRow,
  GridCol
} from '@acx-ui/components'
import { get } from '@acx-ui/config'

import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'
import { KPIs }                 from './KPI'
import { Table }                from './Table'

export function ConfigChange () {
  const isMLISA = get('IS_MLISA_SA')

  const [selected, setSelected] = useState<ConfigChangeType | null >(null)
  const [dotSelect, setDotSelect] = useState<number | null>(null)
  const [chartZoom, setChartZoom] = useState<{ start: number, end: number } | undefined>(undefined)
  const [legend, setLegend] = useState<Record<string, boolean>>({})
  const [initialZoom, setInitialZoom] = useState<{
    start: number, end: number } | undefined>(undefined)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const { selectedRange: dateRange } = useDateRange()

  useEffect(() => {
    setPagination({
      current: 1,
      pageSize: 10
    })
    setSelected(null)
  }, [dateRange])

  const onDotClick = (params: ConfigChangeType) => {
    setSelected(params)
    setDotSelect(selected?.id ?? null)
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: Math.ceil((params.filterId! + 1) / prevPagination.pageSize)
    }))
  }
  const onRowClick = (params: ConfigChangeType) => {
    setSelected(params)
    setChartZoom(initialZoom)
  }

  return <ConfigChangeProvider dateRange={dateRange}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: isMLISA ? '200px' : '170px' }}>
        <Chart
          selected={selected}
          onClick={onDotClick}
          chartZoom={chartZoom}
          setChartZoom={setChartZoom}
          setInitialZoom={setInitialZoom}
          setLegend={setLegend}
          legend={legend}
          setSelectedData={setSelected}
          setPagination={setPagination}
        />
      </GridCol>
      <GridCol col={{ span: 8 }}><KPIs/></GridCol>
      <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}>
        <Table
          selected={selected}
          onRowClick={onRowClick}
          pagination={pagination}
          setPagination={setPagination}
          dotSelect={dotSelect}
          legend={legend}
        />
      </GridCol>
    </GridRow>
  </ConfigChangeProvider>
}
