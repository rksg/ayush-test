import { useContext, useEffect, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  kpisForTab,
  useAnalyticsFilter,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader } from '@acx-ui/components'

import { HealthTab }         from '../'
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

export default function KpiSections (props: { tab: HealthTab }) {
  const { filters } = useAnalyticsFilter()
  const { tab } = props
  const { kpis } = kpisForTab[tab]
  const { useGetKpiThresholdsQuery, useFetchThresholdPermissionQuery } = healthApi
  const thresholdKeys = Object.keys(defaultThreshold) as (keyof KpiThresholdType)[]
  const customThresholdQuery = useGetKpiThresholdsQuery({ ...filters, kpis: thresholdKeys })
  const { data, fulfilledTimeStamp } = customThresholdQuery
  const thresholds = thresholdKeys.reduce((kpis, kpi) => {
    kpis[kpi] = data?.[`${kpi}Threshold`]?.value ?? defaultThreshold[kpi]
    return kpis
  }, {} as KpiThresholdType)
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ path: filters.path })
  const mutationAllowed = Boolean(thresholdPermissionQuery.data?.mutationAllowed)
  return <Loader states={[customThresholdQuery, thresholdPermissionQuery]}>
    {fulfilledTimeStamp && <KpiSection
      key={fulfilledTimeStamp} // forcing component to rerender on newly received thresholds
      kpis={kpis}
      thresholds={thresholds}
      mutationAllowed={mutationAllowed}
    />}
  </Loader>
}

function KpiSection (props: {
  kpis: string[]
  thresholds: KpiThresholdType
  mutationAllowed: boolean
}) {
  const { timeWindow, setTimeWindow } = useContext(HealthPageContext)
  const { filters } = useAnalyticsFilter()
  const isNetwork = filters.path.length === 1
  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(props.thresholds)
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
      {props.kpis.map((kpi) => (
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
