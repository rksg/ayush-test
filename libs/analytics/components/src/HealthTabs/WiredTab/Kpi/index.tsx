import { useEffect, useState } from 'react'

import { connect } from 'echarts'
import { useIntl } from 'react-intl'

import {
  KpiThresholdType,
  healthApi
} from '@acx-ui/analytics/services'
import {
  CategoryTab,
  wiredKPIsForTab,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, Button } from '@acx-ui/components'
import type { AnalyticsFilter }             from '@acx-ui/utils'

export const defaultThreshold: KpiThresholdType = {
  timeToConnect: kpiConfig.timeToConnect.histogram.initialThreshold,
  rss: kpiConfig.rss.histogram.initialThreshold,
  clientThroughput: kpiConfig.clientThroughput.histogram.initialThreshold,
  apCapacity: kpiConfig.apCapacity.histogram.initialThreshold,
  apServiceUptime: kpiConfig.apServiceUptime.histogram.initialThreshold,
  apToSZLatency: kpiConfig.apToSZLatency.histogram.initialThreshold,
  switchPoeUtilization: kpiConfig.switchPoeUtilization.histogram.initialThreshold,
  clusterLatency: kpiConfig.clusterLatency.histogram.initialThreshold
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

function KpiSection (props: {
  kpis: string[]
  thresholds: KpiThresholdType
  mutationAllowed: boolean
  filters : AnalyticsFilter
}) {
  const { kpis } = props
  const [ loadMore, setLoadMore ] = useState<boolean>(true)
  const { $t } = useIntl()
  useEffect(() => { connect('timeSeriesGroup') }, [])
  const displayKpis = loadMore ? kpis.slice(0, 1) : kpis
  return (
    <>
      {displayKpis.map((kpi) => (
        <GridRow key={kpi} $divider>
          <GridCol col={{ span: 16 }}>
            <GridRow style={{ height: '160px' }}>
              <GridCol col={{ span: 5 }}>
                Health Pill for <b>{kpi}</b>
              </GridCol>
              <GridCol col={{ span: 19 }}>
                Time-series chart for <b>{kpi}</b>
              </GridCol>
            </GridRow>
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '160px' }}>
            Histogram for <b>{kpi}</b>
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

export default function KpiSections (props: { tab: CategoryTab, filters: AnalyticsFilter }) {
  const { tab, filters } = props
  const { filter } = filters
  const { kpis } = wiredKPIsForTab()[tab]
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
