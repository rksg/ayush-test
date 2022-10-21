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

import HealthPill    from './Pill'
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
const getDefaultThreshold: KpiThresholdType = {
  timeToConnect: 2000,
  rss: -75,
  clientThroughput: 10000,
  apCapacity: 50,
  apServiceUptime: 0.995,
  apToSZLatency: 200,
  switchPoeUtilization: 0.8
}

export type onApplyType = () =>
   (value: number) => Promise<ThresholdMutationResponse>

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()

  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(getDefaultThreshold)
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

  const onReset = (kpi: keyof KpiThresholdType) => {
    // todo, use data base fetching
    const defaultConfig = getDefaultThreshold[kpi]
    return defaultConfig
  }

  const onApply = (kpi: keyof KpiThresholdType) => {
    return (value: number) => triggerSave({ path: filters.path, name: kpi, value }).unwrap()
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
