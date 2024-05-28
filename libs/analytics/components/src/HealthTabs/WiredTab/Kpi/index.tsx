import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  wiredKPIsForTab
} from '@acx-ui/analytics/utils'
import { Loader }               from '@acx-ui/components'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { KpiSection, defaultThreshold } from '../../../Health/Kpi'

type KpiThresholdsQueryProps = {
  filters: AnalyticsFilter
}

export const useKpiThresholdsQuery = (
  { filters }: KpiThresholdsQueryProps,
  options?: { skip?: boolean }
) => {
  const kpis = Object.keys(defaultThreshold) as (keyof KpiThresholdType)[]
  const kpiThresholdsQueryResults =
    healthApi.useGetKpiThresholdsQuery({ ...filters, kpis }, options)
  const thresholds = kpis.reduce((agg, kpi) => {
    agg[kpi] = kpiThresholdsQueryResults.data?.[`${kpi}Threshold`]?.value ?? defaultThreshold[kpi]
    return agg
  }, {} as KpiThresholdType)

  return { thresholds, kpiThresholdsQueryResults }
}

export default function KpiSections (props: { tab: CategoryTab, filters: AnalyticsFilter }) {
  const { tab, filters } = props
  const { filter } = filters
  const { kpis } = wiredKPIsForTab()[tab]
  const { useFetchThresholdPermissionQuery } = healthApi
  const { thresholds, kpiThresholdsQueryResults } = useKpiThresholdsQuery({ filters })
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ filter })
  const mutationAllowed = Boolean(thresholdPermissionQuery.data?.mutationAllowed)
  return <Loader states={[kpiThresholdsQueryResults, thresholdPermissionQuery]}>
    {kpiThresholdsQueryResults.fulfilledTimeStamp && <KpiSection
      key={kpiThresholdsQueryResults.fulfilledTimeStamp} // forcing component to rerender on newly received thresholds
      kpis={kpis}
      thresholds={thresholds}
      mutationAllowed={mutationAllowed}
      filters={{ ...filters }}
    />}
  </Loader>
}
