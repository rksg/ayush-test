import { useContext, useEffect, useState, useMemo } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import { isArray }  from 'lodash'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'

import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  kpisForTab,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, Button, ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'
import { get }                                                                     from '@acx-ui/config'
import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { SwitchScopes, WifiScopes }                                                from '@acx-ui/types'
import {
  aiOpsApis,
  hasCrossVenuesPermission,
  hasPermission } from '@acx-ui/user'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import BarChart      from './BarChart'
import Histogram     from './Histogram'
import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'

const isMLISA = get('IS_MLISA_SA')

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
  clusterLatency: kpiConfig.clusterLatency.histogram.initialThreshold,
  switchIpv4MulticastUtilization: kpiConfig.switchIpv4MulticastUtilization
    .histogram.initialThreshold,
  switchIpv6MulticastUtilization: kpiConfig.switchIpv6MulticastUtilization
    .histogram.initialThreshold,
  switchIpv4UnicastUtilization: kpiConfig.switchIpv4UnicastUtilization
    .histogram.initialThreshold,
  switchIpv6UnicastUtilization: kpiConfig.switchIpv6UnicastUtilization
    .histogram.initialThreshold,
  switchArpUtilization: kpiConfig.switchArpUtilization
    .histogram.initialThreshold,
  switchMacUtilization: kpiConfig.switchMacUtilization
    .histogram.initialThreshold
}

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
  const isEnergySavingToggled = [
    useIsSplitOn(Features.RUCKUS_AI_ENERGY_SAVING_TOGGLE),
    useIsSplitOn(Features.ACX_UI_ENERGY_SAVING_TOGGLE)
  ].some(Boolean)
  const { tab, filters } = props
  const { filter } = filters
  const { kpis } = kpisForTab(isMLISA, isEnergySavingToggled)[tab as keyof typeof kpisForTab]
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
  kpis: string[] | { [subTab:string]:string[] }
  thresholds: KpiThresholdType
  mutationAllowed: boolean
  filters : AnalyticsFilter
}) {
  const { isSwitch, kpis, thresholds, mutationAllowed, filters } = props
  const { timeWindow, setTimeWindow } = useContext(HealthPageContext)
  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(thresholds)
  const [ loadMoreState, setLoadMoreState ] = useState<{ [key: string]: boolean }>({})
  const { $t } = useIntl()
  const kpiList = useMemo(() => isArray(kpis) ? kpis : Object.values(kpis)[0], [kpis])

  const getSubTabLabel = useMemo(() => (key: string) => {
    switch (key) {
      case 'System':
        return $t({ defaultMessage: 'System' })
      case 'Table':
        return $t({ defaultMessage: 'Table' })
      default:
        return key
    }
  }, [$t])

  const connectChart = useMemo(() => (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }, [])

  const defaultZoom = useMemo(() => (
    moment(filters.startDate).isSame(timeWindow[0]) &&
    moment(filters.endDate).isSame(timeWindow[1])
  ), [filters, timeWindow])

  useEffect(() => { connect('timeSeriesGroup') }, [connectChart])
  useEffect(() => {
    if (isArray(kpis)) {
      setLoadMoreState({ default: kpis.length > 1 })
    } else {
      const initialLoadMoreState = Object.keys(kpis).reduce((acc, key) => {
        const subTabKpis = (kpis as { [subTab: string]: string[] })[key]
        acc[key] = subTabKpis.length > 1
        return acc
      }, {} as { [key: string]: boolean })
      setLoadMoreState(initialLoadMoreState)
    }
  }, [kpis])

  const hasUpdateKpiPermission = useMemo(() => hasCrossVenuesPermission() && hasPermission({
    permission: 'WRITE_HEALTH',
    scopes: [isSwitch ? SwitchScopes.UPDATE : WifiScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateHealthKpiThreshold]
  }), [isSwitch])

  const RenderKpi = useMemo(() => (kpi:string) => (
    <GridRow key={kpi+defaultZoom} $divider>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '160px' }}>
          <GridCol col={{ span: 5 }}>
            <HealthPill
              filters={filters}
              kpi={kpi}
              timeWindow={timeWindow as [string, string]}
              threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
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
            }}
            kpi={kpi as keyof typeof kpiConfig}
            threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
            setKpiThreshold={setKpiThreshold}
            thresholds={kpiThreshold}
            mutationAllowed={mutationAllowed}
            isNetwork={!filters.filter.networkNodes}
            disabled={!hasUpdateKpiPermission}
          />
        ) : (
          <BarChart
            filters={filters}
            kpi={kpi}
            threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
          />
        )}
      </GridCol>
    </GridRow>
  ), [
    defaultZoom,
    filters,
    hasUpdateKpiPermission,
    kpiThreshold,
    mutationAllowed,
    timeWindow,
    connectChart,
    setTimeWindow
  ])

  const LoadMoreButton = useMemo(() => (subTab: string) => (
    <GridRow style={{ height: '80px' }}>
      <GridCol col={{ span: 24 }}>
        <Button
          type='default'
          onClick={() => setLoadMoreState(prevState => ({ ...prevState, [subTab]: false }))}
          style={{ maxWidth: 150, margin: '0 auto' }}
        >{$t({ defaultMessage: 'View more' })}</Button>
      </GridCol>
    </GridRow>
  ), [$t])

  return (
    <>
      {!isArray(kpis) && (() => {
        const tabDetails: ContentSwitcherProps['tabDetails'] = Object.keys(kpis).map((key) => {
          const subTabKpis = (kpis as { [subTab: string]: string[] })[key]
          const kpisToShow = loadMoreState[key] ? subTabKpis.slice(0, 1) : subTabKpis
          return {
            label: getSubTabLabel(key),
            value: key,
            children: (
              <div style={{ marginTop: '16px' }}>
                {kpisToShow.map(RenderKpi)}
                {loadMoreState[key] && LoadMoreButton(key)}
              </div>
            )
          }
        })

        return (
          <ContentSwitcher
            tabDetails={tabDetails}
            size='small'
            align='left'
            tabId='health-infrastructure-kpi'
            tabPersistence={true}
          />
        )
      })()}
      {isArray(kpis) && (loadMoreState['default'] ? kpiList.slice(0, 1) : kpiList).map(RenderKpi)}
      {(isArray(kpis) && loadMoreState['default']) && LoadMoreButton('default') }
    </>
  )
}
