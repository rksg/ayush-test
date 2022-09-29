import { useContext } from 'react'

import { GridCol, GridRow } from '@acx-ui/components'
import { kpisForTab } from '@acx-ui/analytics/utils'

import { HealthPageContext } from '../HealthPageContext'
import { KpiRow } from '../styledComponents'
import { HealthTab } from '../'
import KpiTimeseries  from './Timeseries'
import HealthPill from './Pill'

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { range, path, timeWindow } = healthFilter
  const [startDate, endDate] = timeWindow as [string, string]
  const filters = { startDate, endDate, range, path }
  return (<>{
    kpis.map(kpi => (<KpiRow key={kpi}>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '150px' }}>
          <GridCol col={{ span: 5 }}><HealthPill filters={filters} kpi={kpi} /></GridCol>
          <GridCol col={{ span: 19 }}><KpiTimeseries filters={filters} kpi={kpi} /></GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <div>Threshold Content</div>
      </GridCol>
    </KpiRow>))
  }</>)
}