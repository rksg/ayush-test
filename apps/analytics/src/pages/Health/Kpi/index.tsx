import { useContext, useEffect, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import _            from 'lodash'
import moment       from 'moment-timezone'

import {
  kpisForTab,
  useAnalyticsFilter,
  kpiConfig,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow } from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'

import BarChart              from './BarChart'
import Histogram             from './Histogram'
import HealthPill            from './Pill'
import {
  KpisHavingThreshold,
  useGetKpiThresholdsQuery,
  ThresholdsApiResponse,
  useFetchThresholdPermissionQuery,
  useSaveThresholdMutation
} from './services'
import KpiTimeseries from './Timeseries'
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


export const defaultData = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold
}


export const getDefaultThreshold = (fetchedData?: Partial<FetchedData> | undefined) => {
  const defaultConfig = { ...defaultData }

  if (!fetchedData) return defaultConfig

  const fetchedValuesArr = Object.entries(fetchedData).map(([key, val]) =>
    [ key.replace('Threshold', ''), val.value ])
  const fetchValues = Object.fromEntries(fetchedValuesArr)

  const resultConfig = {
    ...defaultConfig,
    ..._.omitBy(fetchValues, _.isNull)
  }

  return resultConfig
}

export function getResetCallback (data: ThresholdsApiResponse | undefined) {
  return (kpi: keyof KpiThresholdType) => {
    return (baseConfig?: boolean) => {
      const defaultConfig = (baseConfig)
        ? getDefaultThreshold()[kpi]
        : getDefaultThreshold(data as unknown as Partial<FetchedData>)[kpi]
      return defaultConfig
    }
  }
}

export function getApplyCallback (triggerSave: CallableFunction, filters: AnalyticsFilter) {
  return (kpi: keyof KpiThresholdType) => {
    return async (value: number) =>
      await triggerSave({ path: filters.path, name: kpi, value }).unwrap()
  }
}

export type onApplyType = () => (value: number) => Promise<unknown>
export type onResetType = () => (baseConfig?: boolean) => number

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()

  const defaultQuery = useGetKpiThresholdsQuery({
    ...filters,
    kpis: Object.keys(defaultData) as unknown as KpisHavingThreshold[]
  })

  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(defaultData)
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

  const canSave = {
    data: { allowedSave: thresholdPermission.data?.mutationAllowed as boolean | undefined },
    isFetching: thresholdPermission.isFetching,
    isLoading: thresholdPermission.isLoading
  }

  const fetchingDefault = {
    isFetching: defaultQuery.isFetching,
    isLoading: defaultQuery.isLoading,
    data: defaultQuery.data
  }

  const onReset = getResetCallback(defaultQuery.data)
  const onApply = getApplyCallback(triggerSave, filters)

  const isNetwork = (filters.path[0].name === 'Network' && filters.path[0].type === 'network')
    ? true
    : undefined

  return (
    <>
      {kpis.map((kpi) => (
        <GridRow key={kpi+defaultZoom} divider='true'>
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
                isNetwork={isNetwork}
              />
            ) : (
              <BarChart filters={filters}
                kpi={kpi}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType] as unknown as string}
              />
            )}
          </GridCol>
        </GridRow>
      ))}
    </>
  )
}
