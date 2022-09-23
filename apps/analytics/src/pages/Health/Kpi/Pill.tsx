import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { ProgressPill } from '@acx-ui/components'
import { useKpiHistogramQuery } from './services'
import { kpiConfig } from './config'

function HealthPill ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  if (Object(config).histogram) {
    const queryResults = useKpiHistogramQuery({ ...filters, kpi }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data!    
      })
    })
    console.log(queryResults.data)
  }
  
  return <ProgressPill percent={50} />
}
export default HealthPill
