import { useContext } from 'react'

import { kpisForTab, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow }               from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'
import { KpiRow }            from '../styledComponents'
import SLAThreshold          from '../Threshold'

import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()
  return (<>{
    kpis.map(kpi => (<KpiRow key={kpi}>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '160px' }}>
          <GridCol col={{ span: 5 }}>
            <HealthPill filters={filters} kpi={kpi} timeWindow={timeWindow as [string, string]}/>
          </GridCol>
          <GridCol col={{ span: 19 }}><KpiTimeseries filters={filters} kpi={kpi} /></GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '160px' }}>
        <SLAThreshold filters={filters} kpi={kpi}/>
      </GridCol>
    </KpiRow>))
  }</>)
}