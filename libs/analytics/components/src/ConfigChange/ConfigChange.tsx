import { useDateRange, GridRow, GridCol } from '@acx-ui/components'
import { get }                            from '@acx-ui/config'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'

import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'
import { Filter }               from './Filter'
import { KPIs }                 from './KPI'
import { PagedTable }           from './PagedTable'
import { SyncedChart }          from './SyncedChart'
import { Table }                from './Table'

export default function ConfigChange () {
  const isMLISA = get('IS_MLISA_SA')
  const isPaged = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

  const { selectedRange: dateRange } = useDateRange()

  return <ConfigChangeProvider dateRange={dateRange}>
    <>
      {isPaged ? <Filter /> : null}
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: isMLISA ? '200px' : '170px' }}>
          { isPaged ? <SyncedChart/> : <Chart/> }
        </GridCol>
        <GridCol col={{ span: 8, xxl: 6 }}><KPIs/></GridCol>
        <GridCol col={{ span: 16, xxl: 18 }} style={{ minHeight: '180px' }}>
          { isPaged ? <PagedTable /> : <Table/> }
        </GridCol>
      </GridRow>
    </>
  </ConfigChangeProvider>
}
