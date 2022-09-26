import { GridCol, GridRow } from '@acx-ui/components'
import { useAnalyticsFilter } from '@acx-ui/analytics/utils'

import { HealthTab } from '../'
import { kpisForTab } from './config'
import KpiTimeseries  from './Timeseries'
import HealthPill from './Pill'

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const { filters } = useAnalyticsFilter()
  return (<>{
    kpis.map(kpi => (<GridRow key={kpi}>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '200px' }}>
          <GridCol col={{ span: 4 }} ><HealthPill filters={filters} kpi={kpi} /></GridCol>
          <GridCol col={{ span: 20 }} ><KpiTimeseries filters={filters} kpi={kpi} /></GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <div>Threshold Content</div>
      </GridCol>
    </GridRow>))
  }</>)
}