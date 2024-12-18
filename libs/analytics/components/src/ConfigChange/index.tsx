import { useDateRange, GridRow, GridCol } from '@acx-ui/components'
import { get }                            from '@acx-ui/config'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'

import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'
import { KPIs }                 from './KPI'
import { PagedTable }           from './PagedTable'
import { SyncedChart }          from './SyncedChart'
import { Table }                from './Table'

export function ConfigChange () {
  const isMLISA = get('IS_MLISA_SA')
  const isPagedConfigChange = useIsSplitOn(Features.CONFIG_CHANGE_PAGINATION)
  const isPaged = Boolean(isMLISA || isPagedConfigChange)

  const { selectedRange: dateRange } = useDateRange()

  return <ConfigChangeProvider dateRange={dateRange}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: isMLISA ? '200px' : '170px' }}>
        { isPaged ? <SyncedChart/> : <Chart/> }
      </GridCol>
      <GridCol col={{ span: 8, xxl: 6 }}><KPIs/></GridCol>
      <GridCol col={{ span: 16, xxl: 18 }} style={{ minHeight: '180px' }}>
        { isPaged ? <PagedTable /> : <Table/> }
      </GridCol>
    </GridRow>
  </ConfigChangeProvider>
}
