import { useContext, useEffect, useState } from 'react'

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
import { KpiRow }            from '../styledComponents'
import BarChart              from '../Threshold/BarChart'
import Histogram             from '../Threshold/Histogram'

import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'
export type KpiThresholdType = {
  timeToConnect: number;
  rss: number;
  clientThroughput: number;
  apCapacity: number;
  apServiceUptime: number;
  apSzLatency: number;
  switchPoeUtilization: number;
}
export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()

  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>({
    timeToConnect: 2000,
    rss: -75,
    clientThroughput: 10000,
    apCapacity: 50,
    apServiceUptime: 0.995,
    apSzLatency: 200,
    switchPoeUtilization: 0.8
  })

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
              />
            ) : (
              <BarChart filters={filters}
                kpi={kpi}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType] as unknown as string}
              />
            )}
          </GridCol>
        </KpiRow>
      ))}
    </>
  )
}
