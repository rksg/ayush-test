import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  wiredKPIsForTab,
  wiredKPIsForTabPhase2
} from '@acx-ui/analytics/utils'
import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import type { AnalyticsFilter }   from '@acx-ui/utils'

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
  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)

  const isSwitchHealthPhase2Enabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_PHASE2_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_PHASE2_TOGGLE)
  ].some(Boolean)

  const kpiTabs = isSwitchHealthPhase2Enabled ? wiredKPIsForTabPhase2 : wiredKPIsForTab

  const { kpis } = kpiTabs(isSwitchHealth10010eEnabled)[tab as keyof typeof wiredKPIsForTab]
  // eslint-disable-next-line no-console
  console.log('kpis:',kpis)
  const { useFetchThresholdPermissionQuery } = healthApi
  const { thresholds, kpiThresholdsQueryResults } = useKpiThresholdsQuery({ filters })
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ filter })
  const mutationAllowed = Boolean(thresholdPermissionQuery.data?.mutationAllowed)
  return <Loader states={[kpiThresholdsQueryResults, thresholdPermissionQuery]}>
    {kpiThresholdsQueryResults.fulfilledTimeStamp && <KpiSection
      isSwitch
      key={kpiThresholdsQueryResults.fulfilledTimeStamp} // forcing component to rerender on newly received thresholds
      kpis={kpis}
      thresholds={thresholds}
      mutationAllowed={mutationAllowed}
      filters={{ ...filters }}
    />}
  </Loader>
}
