import { useDateRange, GridRow, GridCol } from '@acx-ui/components'
import { get }                            from '@acx-ui/config'

import { ConfigChangeProvider } from './context'
import { Filter }               from './Filter'
import { KPIs }                 from './KPI'
import { PagedTable }           from './PagedTable'
import { SyncedChart }          from './SyncedChart'

export default function ConfigChange () {
  const isMLISA = get('IS_MLISA_SA')
  const { selectedRange: dateRange } = useDateRange()

  return <ConfigChangeProvider dateRange={dateRange}>
    <>
      <Filter />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: isMLISA ? '200px' : '170px' }}>
          <SyncedChart/>
        </GridCol>
        <GridCol col={{ span: 8, xxl: 6 }}><KPIs/></GridCol>
        <GridCol col={{ span: 16, xxl: 18 }} style={{ minHeight: '180px' }}>
          <PagedTable />
        </GridCol>
      </GridRow>
    </>
  </ConfigChangeProvider>
}
