import { useContext, useEffect, useMemo, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import {
  kpisForTab,
  useAnalyticsFilter,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow } from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'
import {
  ThresholdMutationResponse,
  useFetchThresholdPermissionQuery,
  useSaveThresholdMutation
} from '../services'
import { KpiRow } from '../styledComponents'
import BarChart   from '../Threshold/BarChart'
import Histogram  from '../Threshold/Histogram'

import HealthPill                                        from './Pill'
import { KpisHavingThreshold, useGetKpiThresholdsQuery } from './services'
import KpiTimeseries                                     from './Timeseries'
export interface KpiThresholdType {
  timeToConnect: number;
  rss: number;
  clientThroughput: number;
  apCapacity: number;
  apServiceUptime: number;
  apToSZLatency: number;
  switchPoeUtilization: number;
}

type ValueType = {
  value: number | null
}

interface FetchedData {
  timeToConnectThreshold: ValueType;
  rssThreshold: ValueType;
  clientThroughputThreshold: ValueType;
  apCapacityThreshold: ValueType;
  apServiceUptimeThreshold: ValueType;
  apToSZLatencyThreshold: ValueType;
  switchPoeUtilizationThreshold: ValueType;
}


const defaultData = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold
}


const getDefaultThreshold = (fetchedData: Partial<FetchedData> | undefined) => {
  let defaultConfig = { ...defaultData }

  if (!fetchedData) return defaultConfig

  for (let key in Object.keys(defaultConfig)) {
    const target = Object.keys(fetchedData).filter(s => s.includes(key))
    if (!target.length) continue
    const data = fetchedData[target[0] as keyof FetchedData]
    if (!data) continue
    defaultConfig[key as keyof typeof defaultConfig] = data.value
      ?? defaultConfig[key as keyof typeof defaultConfig]
  }

  return defaultConfig
}


export type onApplyType = () =>
   (value: number) => Promise<ThresholdMutationResponse>

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()

  const defaultQuery = useGetKpiThresholdsQuery({
    ...filters,
    kpis: Object.keys(defaultData) as unknown as KpisHavingThreshold[]
  })

  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(
    () => getDefaultThreshold(defaultQuery.data as unknown as Partial<FetchedData>)
  )
  const thresholdPermission = useFetchThresholdPermissionQuery({ path: filters.path })
  const [ triggerSave ] = useSaveThresholdMutation()

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

  const canSave = useMemo(() => ({
    data: { allowedSave: thresholdPermission.data?.mutationAllowed as boolean | undefined },
    isFetching: thresholdPermission.isFetching,
    isLoading: thresholdPermission.isLoading
  }), [thresholdPermission])

  const fetchingDefault = {
    isFetching: defaultQuery.isFetching,
    isLoading: defaultQuery.isLoading
  }

  const onReset = (kpi: keyof KpiThresholdType) => {
    // todo, use data base fetching
    const defaultConfig =
      getDefaultThreshold(defaultQuery.data as unknown as Partial<FetchedData>)[kpi]
    return defaultConfig
  }

  const onApply = (kpi: keyof KpiThresholdType) => {
    return async (value: number) =>
      await triggerSave({ path: filters.path, name: kpi, value }).unwrap()
  }

  return (
    <>
      {kpis.map((kpi) => {
        return (
          <KpiRow key={kpi + defaultZoom}>
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
                  <KpiTimeseries filters={filters}
                    kpi={kpi}
                    threshold={kpiThreshold[kpi as keyof KpiThresholdType] as unknown as string}
                    chartRef={connectChart}
                    setTimeWindow={setTimeWindow}
                    {...(defaultZoom ? {} : { timeWindow })}
                  />
                </GridCol>
              </GridRow>
            </GridCol>
            <GridCol col={{ span: 8 }} style={{ height: '160px' }}>
              {Object(kpiConfig[kpi as keyof typeof kpiConfig])?.histogram ? (
                <Histogram filters={filters}
                  kpi={kpi}
                  threshold={kpiThreshold[kpi as keyof KpiThresholdType] as unknown as string}
                  setKpiThreshold={setKpiThreshold}
                  thresholds={kpiThreshold}
                  onReset={() => onReset(kpi as keyof KpiThresholdType)}
                  onApply={() => onApply(kpi as keyof KpiThresholdType)}
                  canSave={canSave}
                  fetchingDefault={fetchingDefault}
                />
              ) : (
                <BarChart filters={filters}
                  kpi={kpi}
                  threshold={kpiThreshold[kpi as keyof KpiThresholdType] as unknown as string}
                />
              )}
            </GridCol>
          </KpiRow>
        )
      })}
    </>
  )
}
