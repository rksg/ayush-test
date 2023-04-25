import { useContext, useEffect, useState, useMemo } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  kpisForTab,
  AnalyticsFilter,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader } from '@acx-ui/components'
import { useApContext }             from '@acx-ui/rc/utils'

import { HealthPageContext } from '../HealthPageContext'

import BarChart      from './BarChart'
import Histogram     from './Histogram'
import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'

export const defaultThreshold: KpiThresholdType = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold
}


export default function KpiSections (props: { tab: CategoryTab, filters: AnalyticsFilter }) {
  const { tab, filters } = props
  const { kpis } = kpisForTab[tab]
  const { useGetKpiThresholdsQuery, useFetchThresholdPermissionQuery } = healthApi
  const thresholdKeys = Object.keys(defaultThreshold) as (keyof KpiThresholdType)[]
  const apContext = useApContext()
  const finalPath = useMemo(() => {
    if (apContext && apContext.tenantId) {
      const injectedPath = { type: 'zone' as 'zone', name: apContext.venueId as string }
      const copy = [...filters.path]
      copy.unshift(injectedPath)
      return copy
    }
    return filters.path
  }, [apContext, filters.path])
  const customThresholdQuery = useGetKpiThresholdsQuery({
    ...filters, path: finalPath, kpis: thresholdKeys })
  const { data, fulfilledTimeStamp } = customThresholdQuery
  const thresholds = thresholdKeys.reduce((kpis, kpi) => {
    kpis[kpi] = data?.[`${kpi}Threshold`]?.value ?? defaultThreshold[kpi]
    return kpis
  }, {} as KpiThresholdType)
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ path: finalPath })
  const mutationAllowed = Boolean(thresholdPermissionQuery.data?.mutationAllowed)
  return <Loader states={[customThresholdQuery, thresholdPermissionQuery]}>
    {fulfilledTimeStamp && <KpiSection
      key={fulfilledTimeStamp} // forcing component to rerender on newly received thresholds
      kpis={kpis}
      thresholds={thresholds}
      mutationAllowed={mutationAllowed}
      filters={{ ...filters, path: finalPath }}
    />}
  </Loader>
}

function KpiSection (props: {
  kpis: string[]
  thresholds: KpiThresholdType
  mutationAllowed: boolean
  filters : AnalyticsFilter
}) {
  const { kpis, filters, thresholds } = props
  const { timeWindow, setTimeWindow } = useContext(HealthPageContext)
  const isNetwork = filters.path.length === 1
  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(thresholds)
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
  return (
    <>
      {kpis.map((kpi) => (
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
                filters={filters}
                kpi={kpi as keyof typeof kpiConfig}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
                setKpiThreshold={setKpiThreshold}
                thresholds={kpiThreshold}
                mutationAllowed={props.mutationAllowed}
                isNetwork={isNetwork}
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
      ))}
    </>
  )
}
