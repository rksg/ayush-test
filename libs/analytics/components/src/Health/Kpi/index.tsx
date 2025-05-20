import { useContext, useEffect, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'

import {
  KpiThresholdType,
  healthApi,
  useGetTenantSettingsQuery
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  kpisForTab,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, Button } from '@acx-ui/components'
import { get }                              from '@acx-ui/config'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { SwitchScopes, WifiScopes }         from '@acx-ui/types'
import {
  aiOpsApis,
  getUserProfile,
  hasCrossVenuesPermission,
  hasPermission,
  isProfessionalTier
} from '@acx-ui/user'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { AiFeatures }        from '../../IntentAI/config'
import { HealthPageContext } from '../HealthPageContext'

import BarChart      from './BarChart'
import Histogram     from './Histogram'
import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'

const isMLISA = get('IS_MLISA_SA')
const isProfessionalTierUser = () => {
  const { accountTier } = getUserProfile()
  // only R1 has tier, RAI will be undefined
  return isProfessionalTier(accountTier)
}

export const defaultThreshold: KpiThresholdType = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold,
  switchMemoryUtilization: kpiConfig.switchMemoryUtilization.histogram.initialThreshold,
  switchCpuUtilization: kpiConfig.switchCpuUtilization.histogram.initialThreshold,
  switchStormControl: kpiConfig.switchStormControl.histogram.initialThreshold,
  switchUplinkPortUtilization: kpiConfig.switchUplinkPortUtilization.histogram.initialThreshold,
  switchPortUtilization: kpiConfig.switchPortUtilization.histogram.initialThreshold,
  clusterLatency: kpiConfig.clusterLatency.histogram.initialThreshold
}

type KpiThresholdsQueryProps = {
  filters: AnalyticsFilter
}

export function useGetEnergySavingFromTenantSettings () {
  const tenantSettingsQuery = useGetTenantSettingsQuery(undefined, {
    skip: !hasPermission({ permission: 'READ_USERS' })
  })
  const tenantSettings = tenantSettingsQuery.data
  if (!tenantSettings || !tenantSettings['enabled-intent-features']) {
    return false
  }
  const enabledIntentFeatures = tenantSettings['enabled-intent-features'] as unknown as string[]
  return enabledIntentFeatures?.includes(AiFeatures.EcoFlex) ?? false
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
  const isEnergySavingToggled = [
    useIsSplitOn(Features.RUCKUS_AI_ENERGY_SAVING_TOGGLE),
    useIsSplitOn(Features.ACX_UI_ENERGY_SAVING_TOGGLE)
  ].some(Boolean)
  const { tab, filters } = props
  const { filter } = filters
  const { kpis } = kpisForTab(isMLISA, isProfessionalTierUser(),
    isEnergySavingToggled)[tab as keyof typeof kpisForTab]
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

export function KpiSection (props: {
  isSwitch?: boolean
  kpis: string[]
  thresholds: KpiThresholdType
  mutationAllowed: boolean
  filters : AnalyticsFilter
}) {
  const { kpis, filters, thresholds, isSwitch } = props
  const { timeWindow, setTimeWindow } = useContext(HealthPageContext)
  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(thresholds)
  const [ loadMore, setLoadMore ] = useState<boolean>(true)
  const { $t } = useIntl()
  const isEnergySavingEnabled = useGetEnergySavingFromTenantSettings()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  const defaultZoom = (
    moment(filters.startDate).isSame(timeWindow[0]) &&
    moment(filters.endDate).isSame(timeWindow[1])
  )
  useEffect(() => { connect('timeSeriesGroup') }, [])
  useEffect(() => { setLoadMore(kpis?.length > 1) }, [kpis])

  const hasUpdateKpiPermission = hasCrossVenuesPermission() && hasPermission({
    permission: 'WRITE_HEALTH',
    scopes: [isSwitch ? SwitchScopes.UPDATE : WifiScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateHealthKpiThreshold]
  })

  const displayKpis = loadMore ? kpis.slice(0, 1) : kpis
  const isShowNoData = (kpi: string) => kpi === 'energySavingAPs' && !isEnergySavingEnabled

  return (
    <>
      {displayKpis.map((kpi) => (
        <GridRow key={kpi+defaultZoom} $divider>
          <GridCol col={{ span: 16 }}>
            <GridRow style={{ height: '160px' }}>
              <GridCol col={{ span: 5 }}>
                <HealthPill
                  filters={filters}
                  kpi={kpi}
                  timeWindow={timeWindow as [string, string]}
                  threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
                  isShowNoData={isShowNoData(kpi)}
                />
              </GridCol>
              <GridCol col={{ span: 19 }}>
                <KpiTimeseries
                  filters={filters}
                  kpi={kpi as unknown as keyof typeof kpiConfig}
                  threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
                  chartRef={connectChart}
                  setTimeWindow={setTimeWindow}
                  {...(defaultZoom ? { timeWindow: undefined } : { timeWindow })}
                  isShowNoData={isShowNoData(kpi)}
                />
              </GridCol>
            </GridRow>
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '160px' }}>
            {Object(kpiConfig[kpi as keyof typeof kpiConfig])?.histogram ? (
              <Histogram
                filters={{
                  ...filters,
                  startDate: timeWindow[0] as string,
                  endDate: timeWindow[1] as string
                }
                }
                kpi={kpi as keyof typeof kpiConfig}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
                setKpiThreshold={setKpiThreshold}
                thresholds={kpiThreshold}
                mutationAllowed={props.mutationAllowed}
                isNetwork={!filters.filter.networkNodes}
                disabled={!hasUpdateKpiPermission}
              />
            ) : (
              <BarChart
                filters={filters}
                kpi={kpi}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
                isShowNoData={isShowNoData(kpi)}
              />
            )}
          </GridCol>
        </GridRow>
      ))}
      { loadMore &&
      <GridRow style={{ height: '80px' }}>
        <GridCol col={{ span: 24 }}>
          <Button
            type='default'
            onClick={() => setLoadMore(false)}
            style={{ maxWidth: 150, margin: '0 auto' }}
          >{$t({ defaultMessage: 'View more' })}</Button>
        </GridCol>
      </GridRow>
      }
    </>
  )
}
