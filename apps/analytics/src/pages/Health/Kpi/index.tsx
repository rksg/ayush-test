import { useContext, useEffect, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import {
  kpisForTab,
  useAnalyticsFilter,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader } from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'

import BarChart                      from './BarChart'
import Histogram                     from './Histogram'
import HealthPill                    from './Pill'
import {
  KpisHavingThreshold,
  useGetKpiThresholdsQuery,
  useFetchThresholdPermissionQuery
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

export const defaultThreshold = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold
}


export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()

  const customThresholdQuery = useGetKpiThresholdsQuery({
    ...filters,
    kpis: Object.keys(defaultThreshold) as unknown as KpisHavingThreshold[]
  })

  const [ kpiThreshold, setKpiThreshold ] = useState<KpiThresholdType>(defaultThreshold)
  const thresholdPermissionQuery = useFetchThresholdPermissionQuery({ path: filters.path })

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
    data: { allowedSave: thresholdPermissionQuery.data?.mutationAllowed as boolean | undefined },
    isFetching: thresholdPermissionQuery.isFetching,
    isLoading: thresholdPermissionQuery.isLoading
  }

  const fetchingCustomThresholds = {
    isFetching: customThresholdQuery.isFetching,
    isLoading: customThresholdQuery.isLoading,
    data: customThresholdQuery.data
  }

  const isNetwork = (filters.path[0].name === 'Network' && filters.path[0].type === 'network')
    ? true
    : undefined

  return (
    <Loader states={[customThresholdQuery, thresholdPermissionQuery]}>
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
                permissionQuery={canSave}
                customThresholdQuery={fetchingCustomThresholds}
                isNetwork={isNetwork}
              />
            ) : (
              <BarChart filters={filters}
                kpi={kpi}
                threshold={kpiThreshold[kpi as keyof KpiThresholdType]}
              />
            )}
          </GridCol>
        </GridRow>
      ))}
    </Loader>
  )
}
