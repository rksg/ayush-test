import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'

import BarChart  from './BarChart'
import Histogram from './Histogram'

function SLAThreshold ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { histogram } = Object(kpiConfig[kpi as keyof typeof kpiConfig])

  return (
    histogram ? <Histogram filters={filters} kpi={kpi}/> : (
      <BarChart filters={filters} kpi={kpi}/>
    )
  )
}

export default SLAThreshold
